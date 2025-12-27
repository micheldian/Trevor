import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Brackets } from 'typeorm';
import { Request } from 'express';
import { Job, JobStatus } from '../../jobs/entities/job.entity';
import { Match, MatchStatus } from '../../matches/entities/match.entity';
import { AuditLogService } from '../../audit-log/audit-log.service';
import { GetJobsQueryDto } from '../dto/get-jobs-query.dto';
import {
  AdminJobResponseDto,
  GetJobsResponseDto,
  AdminJobEmployerDto,
} from '../dto/admin-job-response.dto';
import {
  CancelJobDto,
  CompleteJobDto,
  ReopenJobDto,
  ChangeJobStatusDto,
  JobActionResponseDto,
} from '../dto/job-actions.dto';

@Injectable()
export class AdminJobsService {
  private readonly logger = new Logger(AdminJobsService.name);

  constructor(
    @InjectRepository(Job)
    private readonly jobRepo: Repository<Job>,
    @InjectRepository(Match)
    private readonly matchRepo: Repository<Match>,
    private readonly auditLogService: AuditLogService,
  ) {}

  /**
   * Get jobs with comprehensive filters for admin panel
   */
  async getJobs(
    dto: GetJobsQueryDto,
    adminUserId: string,
    request?: Request,
  ): Promise<GetJobsResponseDto> {
    const {
      status,
      employerId,
      culture,
      tag,
      createdAfter,
      createdBefore,
      jobDateAfter,
      jobDateBefore,
      maxDistanceKm,
      latitude,
      longitude,
      q,
      limit = 20,
      offset = 0,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
    } = dto;

    // Build query
    const qb = this.jobRepo
      .createQueryBuilder('job')
      .leftJoinAndSelect('job.employer', 'employer')
      .leftJoinAndSelect('employer.user', 'user');

    // Filter by status
    if (status) {
      qb.andWhere('job.status = :status', { status });
    }

    // Filter by employer
    if (employerId) {
      qb.andWhere('job.employerId = :employerId', { employerId });
    }

    // Filter by culture (partial match)
    if (culture) {
      qb.andWhere('job.culture ILIKE :culture', { culture: `%${culture}%` });
    }

    // Filter by tag (array contains)
    if (tag) {
      qb.andWhere(':tag = ANY(job.tags)', { tag });
    }

    // Filter by created_at range
    if (createdAfter) {
      qb.andWhere('job.createdAt >= :createdAfter', {
        createdAfter: new Date(createdAfter),
      });
    }
    if (createdBefore) {
      qb.andWhere('job.createdAt <= :createdBefore', {
        createdBefore: new Date(createdBefore),
      });
    }

    // Filter by specific_date range
    if (jobDateAfter) {
      qb.andWhere('job.specificDate >= :jobDateAfter', {
        jobDateAfter: new Date(jobDateAfter),
      });
    }
    if (jobDateBefore) {
      qb.andWhere('job.specificDate <= :jobDateBefore', {
        jobDateBefore: new Date(jobDateBefore),
      });
    }

    // Filter by distance using PostGIS
    if (maxDistanceKm && latitude !== undefined && longitude !== undefined) {
      // Use PostGIS ST_DWithin with geography type (meters)
      const maxDistanceMeters = maxDistanceKm * 1000;
      qb.andWhere(
        `ST_DWithin(
          job.location,
          ST_SetSRID(ST_MakePoint(:longitude, :latitude), 4326)::geography,
          :maxDistance
        )`,
        {
          latitude,
          longitude,
          maxDistance: maxDistanceMeters,
        },
      );

      // Add distance calculation to results
      qb.addSelect(
        `ST_Distance(
          job.location,
          ST_SetSRID(ST_MakePoint(:longitude, :latitude), 4326)::geography
        ) / 1000`,
        'distance_km',
      );
    }

    // Text search across title, description, culture
    if (q) {
      qb.andWhere(
        new Brackets((qbBracket) => {
          qbBracket
            .where('job.title ILIKE :query', { query: `%${q}%` })
            .orWhere('job.description ILIKE :query', { query: `%${q}%` })
            .orWhere('job.culture ILIKE :query', { query: `%${q}%` })
            .orWhere('job.tags::text ILIKE :query', { query: `%${q}%` });
        }),
      );
    }

    // Sorting
    const allowedSortFields = ['createdAt', 'updatedAt', 'publishedAt', 'specificDate'];
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';
    const sortDirection = sortOrder === 'ASC' ? 'ASC' : 'DESC';

    if (maxDistanceKm && latitude !== undefined && longitude !== undefined) {
      // If distance filtering is active, sort by distance first
      qb.addOrderBy('distance_km', 'ASC');
      qb.addOrderBy(`job.${sortField}`, sortDirection);
    } else {
      qb.orderBy(`job.${sortField}`, sortDirection);
    }

    // Count total
    const total = await qb.getCount();

    // Get paginated results
    const results = await qb.skip(offset).take(limit).getRawAndEntities();

    // Get match counts and confirmed match IDs for all jobs
    const jobIds = results.entities.map((job) => job.id);
    const matchStats = await this.getMatchStatistics(jobIds);

    // Map to DTOs
    const data: AdminJobResponseDto[] = results.entities.map((job, index) => {
      const raw = results.raw[index];
      const stats = matchStats.get(job.id) || { nbMatches: 0, confirmedMatchId: undefined };
      const distance = raw.distance_km ? Number(raw.distance_km) : undefined;

      return this.mapToDto(job, stats.nbMatches, stats.confirmedMatchId, distance);
    });

    // Audit log for sensitive action
    await this.auditLogService.create({
      actorUserId: adminUserId,
      action: 'ADMIN_VIEW_JOBS',
      entityType: 'jobs',
      entityId: undefined,
      beforeJson: undefined,
      afterJson: {
        filters: dto,
        resultCount: data.length,
        total,
      },
      ipAddress: request?.ip,
      userAgent: request?.headers['user-agent'],
    });

    return {
      data,
      meta: {
        total,
        limit,
        offset,
        hasMore: total > offset + limit,
      },
    };
  }

  /**
   * Get match statistics for a list of jobs
   */
  private async getMatchStatistics(
    jobIds: string[],
  ): Promise<Map<string, { nbMatches: number; confirmedMatchId?: string }>> {
    if (jobIds.length === 0) {
      return new Map();
    }

    // Query to get count of matches per job and confirmed match ID
    const matchCounts = await this.matchRepo
      .createQueryBuilder('match')
      .select('match.jobId', 'jobId')
      .addSelect('COUNT(*)', 'nbMatches')
      .addSelect(
        `MAX(CASE WHEN match.status = '${MatchStatus.CONFIRMED}' THEN match.id ELSE NULL END)`,
        'confirmedMatchId',
      )
      .where('match.jobId IN (:...jobIds)', { jobIds })
      .andWhere('match.isActive = :isActive', { isActive: true })
      .groupBy('match.jobId')
      .getRawMany();

    const statsMap = new Map<string, { nbMatches: number; confirmedMatchId?: string }>();

    for (const row of matchCounts) {
      statsMap.set(row.jobId, {
        nbMatches: parseInt(row.nbMatches, 10),
        confirmedMatchId: row.confirmedMatchId ?? undefined,
      });
    }

    return statsMap;
  }

  /**
   * Map Job entity to AdminJobResponseDto
   */
  private mapToDto(
    job: Job,
    nbMatches: number,
    confirmedMatchId?: string,
    distance?: number,
  ): AdminJobResponseDto {
    const employerDto: AdminJobEmployerDto = {
      id: job.employer.id,
      userId: job.employer.userId,
      city: job.employer.city ?? undefined,
      postalCode: job.employer.postalCode ?? undefined,
      type: job.employer.type,
      firstName: job.employer.user?.firstName ?? undefined,
      lastName: job.employer.user?.lastName ?? undefined,
      avatarUrl: job.employer.user?.avatarUrl ?? undefined,
    };

    return {
      id: job.id,
      employerId: job.employerId,
      employer: employerDto,
      title: job.title,
      description: job.description ?? undefined,
      culture: job.culture,
      tags: job.tags || [],
      requiredSkills: job.requiredSkills || [],
      dateType: job.dateType,
      specificDate: job.specificDate ?? undefined,
      timeSlot: job.timeSlot,
      nbPeople: job.nbPeople,
      latitude: Number(job.latitude),
      longitude: Number(job.longitude),
      address: job.address ?? undefined,
      city: job.city ?? undefined,
      postalCode: job.postalCode ?? undefined,
      status: job.status,
      hourlyRate: job.hourlyRate ? Number(job.hourlyRate) : undefined,
      estimatedHours: job.estimatedHours ?? undefined,
      isUrgent: job.isUrgent,
      isActive: job.isActive,
      createdAt: job.createdAt,
      updatedAt: job.updatedAt,
      publishedAt: job.publishedAt ?? undefined,
      confirmedAt: job.confirmedAt ?? undefined,
      completedAt: job.completedAt ?? undefined,
      cancelledAt: job.cancelledAt ?? undefined,
      cancellationReason: job.cancellationReason ?? undefined,
      nbMatches,
      confirmedMatchId,
      distance,
    };
  }

  /**
   * Cancel a job
   * Rule: Cannot cancel a COMPLETED job (would need to reopen first)
   */
  async cancelJob(
    jobId: string,
    dto: CancelJobDto,
    adminUserId: string,
    request?: Request,
  ): Promise<JobActionResponseDto> {
    const job = await this.jobRepo.findOne({
      where: { id: jobId },
      relations: ['employer', 'employer.user'],
    });

    if (!job) {
      throw new NotFoundException(`Job with ID ${jobId} not found`);
    }

    const previousStatus = job.status;

    // Validation: Cannot cancel a COMPLETED job
    if (job.status === JobStatus.COMPLETED) {
      throw new BadRequestException(
        'Cannot cancel a completed job. Please reopen it first if needed.',
      );
    }

    // Validation: Already cancelled
    if (job.status === JobStatus.CANCELLED) {
      throw new BadRequestException('Job is already cancelled');
    }

    // Capture before state for audit
    const beforeState = { ...job };

    // Update job
    job.status = JobStatus.CANCELLED;
    job.cancellationReason = dto.reason;
    job.cancelledAt = new Date();

    await this.jobRepo.save(job);

    // Audit log
    await this.auditLogService.create({
      actorUserId: adminUserId,
      action: 'ADMIN_CANCEL_JOB',
      entityType: 'job',
      entityId: jobId,
      beforeJson: { status: previousStatus },
      afterJson: {
        status: job.status,
        cancellationReason: dto.reason,
        adminNotes: dto.adminNotes,
      },
      ipAddress: request?.ip,
      userAgent: request?.headers['user-agent'],
    });

    this.logger.log(`Admin ${adminUserId} cancelled job ${jobId}: ${dto.reason}`);

    return {
      success: true,
      message: 'Job cancelled successfully',
      previousStatus,
      newStatus: job.status,
      jobId: job.id,
    };
  }

  /**
   * Force complete a job
   * Rule: Normally requires CONFIRMED status, but can override with flag
   */
  async completeJob(
    jobId: string,
    dto: CompleteJobDto,
    adminUserId: string,
    request?: Request,
  ): Promise<JobActionResponseDto> {
    const job = await this.jobRepo.findOne({
      where: { id: jobId },
      relations: ['employer', 'employer.user'],
    });

    if (!job) {
      throw new NotFoundException(`Job with ID ${jobId} not found`);
    }

    const previousStatus = job.status;
    const warnings: string[] = [];

    // Validation: Already completed
    if (job.status === JobStatus.COMPLETED) {
      throw new BadRequestException('Job is already completed');
    }

    // Validation: Cannot complete a cancelled job without override
    if (job.status === JobStatus.CANCELLED && !dto.override) {
      throw new BadRequestException(
        'Cannot complete a cancelled job. Please reopen it first or use override flag.',
      );
    }

    // Validation: Should be CONFIRMED before completing (unless override)
    if (job.status !== JobStatus.CONFIRMED && !dto.override) {
      throw new BadRequestException(
        `Job must be in CONFIRMED status to complete. Current status: ${job.status}. Use override flag to force completion.`,
      );
    }

    // Warning if override was used
    if (dto.override && job.status !== JobStatus.CONFIRMED) {
      warnings.push(`Override used: Job was in ${job.status} status instead of CONFIRMED`);
      this.logger.warn(
        `Admin ${adminUserId} force-completed job ${jobId} from status ${job.status} (override)`,
      );
    }

    // Update job
    job.status = JobStatus.COMPLETED;
    job.completedAt = new Date();

    await this.jobRepo.save(job);

    // Audit log
    await this.auditLogService.create({
      actorUserId: adminUserId,
      action: 'ADMIN_COMPLETE_JOB',
      entityType: 'job',
      entityId: jobId,
      beforeJson: { status: previousStatus },
      afterJson: {
        status: job.status,
        override: dto.override || false,
        notes: dto.notes,
        adminNotes: dto.adminNotes,
        warnings,
      },
      ipAddress: request?.ip,
      userAgent: request?.headers['user-agent'],
    });

    this.logger.log(`Admin ${adminUserId} completed job ${jobId}`);

    return {
      success: true,
      message: 'Job completed successfully',
      previousStatus,
      newStatus: job.status,
      jobId: job.id,
      warnings: warnings.length > 0 ? warnings : undefined,
    };
  }

  /**
   * Reopen a job
   * Rule: Can reopen CANCELLED or COMPLETED jobs to a target status
   */
  async reopenJob(
    jobId: string,
    dto: ReopenJobDto,
    adminUserId: string,
    request?: Request,
  ): Promise<JobActionResponseDto> {
    const job = await this.jobRepo.findOne({
      where: { id: jobId },
      relations: ['employer', 'employer.user'],
    });

    if (!job) {
      throw new NotFoundException(`Job with ID ${jobId} not found`);
    }

    const previousStatus = job.status;
    const warnings: string[] = [];

    // Validation: Can only reopen CANCELLED or COMPLETED jobs
    if (job.status !== JobStatus.CANCELLED && job.status !== JobStatus.COMPLETED) {
      throw new BadRequestException(
        `Can only reopen CANCELLED or COMPLETED jobs. Current status: ${job.status}`,
      );
    }

    // Validation: Target status must be valid for reopening
    const validReopenStatuses = [
      JobStatus.DRAFT,
      JobStatus.PUBLISHED,
      JobStatus.IN_CONTACT,
      JobStatus.CONFIRMED,
    ];

    if (!validReopenStatuses.includes(dto.targetStatus)) {
      throw new BadRequestException(
        `Invalid target status for reopening: ${dto.targetStatus}. Valid statuses: ${validReopenStatuses.join(', ')}`,
      );
    }

    // Warning if reopening to unusual status
    if (dto.targetStatus !== JobStatus.PUBLISHED) {
      warnings.push(
        `Job reopened to ${dto.targetStatus} instead of the typical PUBLISHED status`,
      );
    }

    // Update job
    job.status = dto.targetStatus;

    // Clear completion/cancellation timestamps
    if (previousStatus === JobStatus.CANCELLED) {
      job.cancelledAt = undefined;
      job.cancellationReason = undefined;
    }
    if (previousStatus === JobStatus.COMPLETED) {
      job.completedAt = undefined;
    }

    await this.jobRepo.save(job);

    // Audit log
    await this.auditLogService.create({
      actorUserId: adminUserId,
      action: 'ADMIN_REOPEN_JOB',
      entityType: 'job',
      entityId: jobId,
      beforeJson: { status: previousStatus },
      afterJson: {
        status: job.status,
        targetStatus: dto.targetStatus,
        reason: dto.reason,
        adminNotes: dto.adminNotes,
        warnings,
      },
      ipAddress: request?.ip,
      userAgent: request?.headers['user-agent'],
    });

    this.logger.log(
      `Admin ${adminUserId} reopened job ${jobId} from ${previousStatus} to ${dto.targetStatus}`,
    );

    return {
      success: true,
      message: `Job reopened successfully from ${previousStatus} to ${dto.targetStatus}`,
      previousStatus,
      newStatus: job.status,
      jobId: job.id,
      warnings: warnings.length > 0 ? warnings : undefined,
    };
  }

  /**
   * Change job status
   * Rule: Validates logical transitions unless override is used
   */
  async changeJobStatus(
    jobId: string,
    dto: ChangeJobStatusDto,
    adminUserId: string,
    request?: Request,
  ): Promise<JobActionResponseDto> {
    const job = await this.jobRepo.findOne({
      where: { id: jobId },
      relations: ['employer', 'employer.user'],
    });

    if (!job) {
      throw new NotFoundException(`Job with ID ${jobId} not found`);
    }

    const previousStatus = job.status;
    const warnings: string[] = [];

    // Validation: No change
    if (job.status === dto.status) {
      throw new BadRequestException(`Job is already in ${dto.status} status`);
    }

    // Define valid status transitions
    const validTransitions: Record<JobStatus, JobStatus[]> = {
      [JobStatus.DRAFT]: [JobStatus.PUBLISHED, JobStatus.CANCELLED],
      [JobStatus.PUBLISHED]: [
        JobStatus.DRAFT,
        JobStatus.IN_CONTACT,
        JobStatus.CONFIRMED,
        JobStatus.CANCELLED,
      ],
      [JobStatus.IN_CONTACT]: [
        JobStatus.PUBLISHED,
        JobStatus.CONFIRMED,
        JobStatus.CANCELLED,
      ],
      [JobStatus.CONFIRMED]: [
        JobStatus.IN_CONTACT,
        JobStatus.COMPLETED,
        JobStatus.CANCELLED,
      ],
      [JobStatus.COMPLETED]: [JobStatus.PUBLISHED], // Can reopen
      [JobStatus.CANCELLED]: [JobStatus.PUBLISHED], // Can reopen
    };

    // Validation: Check if transition is valid (unless override)
    if (!dto.override) {
      const allowedStatuses = validTransitions[job.status] || [];
      if (!allowedStatuses.includes(dto.status)) {
        throw new BadRequestException(
          `Invalid status transition from ${job.status} to ${dto.status}. ` +
            `Allowed transitions: ${allowedStatuses.join(', ')}. ` +
            `Use override flag to force this transition.`,
        );
      }
    } else {
      warnings.push(
        `Override used: Status transition from ${job.status} to ${dto.status} was forced`,
      );
      this.logger.warn(
        `Admin ${adminUserId} forced status change on job ${jobId}: ${job.status} -> ${dto.status}`,
      );
    }

    // Update job and related timestamps
    job.status = dto.status;

    // Update timestamps based on new status
    switch (dto.status) {
      case JobStatus.PUBLISHED:
        if (!job.publishedAt) {
          job.publishedAt = new Date();
        }
        // Clear cancellation/completion if reopening
        job.cancelledAt = undefined;
        job.cancellationReason = undefined;
        job.completedAt = undefined;
        break;

      case JobStatus.CONFIRMED:
        if (!job.confirmedAt) {
          job.confirmedAt = new Date();
        }
        break;

      case JobStatus.COMPLETED:
        if (!job.completedAt) {
          job.completedAt = new Date();
        }
        break;

      case JobStatus.CANCELLED:
        if (!job.cancelledAt) {
          job.cancelledAt = new Date();
        }
        // Set reason if provided
        if (dto.reason) {
          job.cancellationReason = dto.reason;
        } else if (!job.cancellationReason) {
          job.cancellationReason = 'Cancelled by admin';
        }
        break;
    }

    await this.jobRepo.save(job);

    // Audit log
    await this.auditLogService.create({
      actorUserId: adminUserId,
      action: 'ADMIN_CHANGE_JOB_STATUS',
      entityType: 'job',
      entityId: jobId,
      beforeJson: { status: previousStatus },
      afterJson: {
        status: job.status,
        reason: dto.reason,
        override: dto.override || false,
        adminNotes: dto.adminNotes,
        warnings,
      },
      ipAddress: request?.ip,
      userAgent: request?.headers['user-agent'],
    });

    this.logger.log(
      `Admin ${adminUserId} changed job ${jobId} status: ${previousStatus} -> ${dto.status}`,
    );

    return {
      success: true,
      message: `Job status changed successfully from ${previousStatus} to ${dto.status}`,
      previousStatus,
      newStatus: job.status,
      jobId: job.id,
      warnings: warnings.length > 0 ? warnings : undefined,
    };
  }
}
