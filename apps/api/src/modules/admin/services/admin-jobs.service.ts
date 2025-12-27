import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Brackets } from 'typeorm';
import { Request } from 'express';
import { Job } from '../../jobs/entities/job.entity';
import { Match, MatchStatus } from '../../matches/entities/match.entity';
import { AuditLogService } from '../../audit-log/audit-log.service';
import { GetJobsQueryDto } from '../dto/get-jobs-query.dto';
import {
  AdminJobResponseDto,
  GetJobsResponseDto,
  AdminJobEmployerDto,
} from '../dto/admin-job-response.dto';

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
}
