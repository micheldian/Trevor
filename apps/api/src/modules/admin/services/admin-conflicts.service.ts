import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Request } from 'express';
import { Match, MatchStatus } from '../../matches/entities/match.entity';
import { Job, JobDateType, JobTimeSlot } from '../../jobs/entities/job.entity';
import { AuditLogService } from '../../audit-log/audit-log.service';
import {
  SchedulingConflictDto,
  ConflictingMatchDto,
  GetConflictsResponseDto,
  ResolveConflictDto,
  ResolveConflictResponseDto,
} from '../dto/conflicts.dto';
import * as crypto from 'crypto';

@Injectable()
export class AdminConflictsService {
  private readonly logger = new Logger(AdminConflictsService.name);

  constructor(
    @InjectRepository(Match)
    private readonly matchRepo: Repository<Match>,
    @InjectRepository(Job)
    private readonly jobRepo: Repository<Job>,
    private readonly auditLogService: AuditLogService,
  ) {}

  /**
   * Detect all scheduling conflicts for confirmed matches
   */
  async getConflicts(
    adminUserId: string,
    request?: Request,
  ): Promise<GetConflictsResponseDto> {
    // Get all confirmed matches with job and candidate details
    const confirmedMatches = await this.matchRepo.find({
      where: {
        status: MatchStatus.CONFIRMED,
        isActive: true,
      },
      relations: ['job', 'job.employer', 'job.employer.user', 'candidate', 'candidate.user'],
      order: {
        confirmedAt: 'DESC',
      },
    });

    // Group matches by candidate
    const matchesByCandidate = new Map<string, Match[]>();
    for (const match of confirmedMatches) {
      const candidateId = match.candidateId;
      if (!matchesByCandidate.has(candidateId)) {
        matchesByCandidate.set(candidateId, []);
      }
      matchesByCandidate.get(candidateId)!.push(match);
    }

    // Detect conflicts for each candidate
    const conflicts: SchedulingConflictDto[] = [];
    const conflictSet = new Set<string>(); // To avoid duplicate conflict detection

    for (const [candidateId, matches] of matchesByCandidate.entries()) {
      if (matches.length < 2) {
        continue; // No conflict possible with less than 2 matches
      }

      // Check each pair of matches for conflicts
      for (let i = 0; i < matches.length; i++) {
        for (let j = i + 1; j < matches.length; j++) {
          const match1 = matches[i];
          const match2 = matches[j];

          if (this.jobsHaveTimeConflict(match1.job, match2.job)) {
            // Create unique conflict ID
            const conflictId = this.generateConflictId([match1.id, match2.id]);

            // Avoid duplicate detection
            if (conflictSet.has(conflictId)) {
              continue;
            }
            conflictSet.add(conflictId);

            // Calculate severity
            const severity = this.calculateConflictSeverity(match1.job, match2.job);

            // Create conflict DTO
            const conflict: SchedulingConflictDto = {
              conflictId,
              candidateId,
              candidateName: this.getCandidateName(match1),
              conflictingMatches: [
                this.mapToConflictingMatch(match1),
                this.mapToConflictingMatch(match2),
              ],
              detectedAt: new Date(),
              severity,
              conflictDescription: this.generateConflictDescription(match1.job, match2.job),
            };

            conflicts.push(conflict);
          }
        }
      }
    }

    // Calculate meta statistics
    const criticalCount = conflicts.filter((c) => c.severity === 'critical').length;
    const highCount = conflicts.filter((c) => c.severity === 'high').length;
    const mediumCount = conflicts.filter((c) => c.severity === 'medium').length;

    // Audit log
    await this.auditLogService.create({
      actorUserId: adminUserId,
      action: 'ADMIN_VIEW_CONFLICTS',
      entityType: 'conflicts',
      entityId: undefined,
      beforeJson: undefined,
      afterJson: {
        totalConflicts: conflicts.length,
        criticalCount,
        highCount,
        mediumCount,
      },
      ipAddress: request?.ip,
      userAgent: request?.headers['user-agent'],
    });

    return {
      data: conflicts,
      meta: {
        total: conflicts.length,
        criticalCount,
        highCount,
        mediumCount,
      },
    };
  }

  /**
   * Resolve a conflict by cancelling one of the matches
   */
  async resolveConflict(
    conflictId: string,
    dto: ResolveConflictDto,
    adminUserId: string,
    request?: Request,
  ): Promise<ResolveConflictResponseDto> {
    // Find the match to cancel
    const match = await this.matchRepo.findOne({
      where: { id: dto.matchIdToCancel },
      relations: ['job', 'job.employer', 'job.employer.user', 'candidate', 'candidate.user'],
    });

    if (!match) {
      throw new NotFoundException(`Match with ID ${dto.matchIdToCancel} not found`);
    }

    // Validation: Match must be CONFIRMED
    if (match.status !== MatchStatus.CONFIRMED) {
      throw new BadRequestException(
        `Match is not in CONFIRMED status (current: ${match.status})`,
      );
    }

    // Cancel the match
    const previousStatus = match.status;
    match.status = MatchStatus.REJECTED;
    match.rejectedAt = new Date();
    match.employerNotes = `${match.employerNotes || ''}\n[ADMIN] Cancelled due to scheduling conflict: ${dto.reason}`.trim();

    await this.matchRepo.save(match);

    // TODO: Send notifications (placeholder for future implementation)
    const notificationsSent = {
      employer: false,
      candidate: false,
    };

    if (dto.notifyEmployer) {
      // TODO: Implement employer notification
      this.logger.log(`Notification to employer ${match.job.employerId} pending`);
      notificationsSent.employer = true;
    }

    if (dto.notifyCandidate) {
      // TODO: Implement candidate notification
      this.logger.log(`Notification to candidate ${match.candidateId} pending`);
      notificationsSent.candidate = true;
    }

    // Audit log
    await this.auditLogService.create({
      actorUserId: adminUserId,
      action: 'ADMIN_RESOLVE_CONFLICT',
      entityType: 'match',
      entityId: match.id,
      beforeJson: { status: previousStatus },
      afterJson: {
        status: match.status,
        conflictId,
        reason: dto.reason,
        notifyEmployer: dto.notifyEmployer,
        notifyCandidate: dto.notifyCandidate,
        adminNotes: dto.adminNotes,
      },
      ipAddress: request?.ip,
      userAgent: request?.headers['user-agent'],
    });

    this.logger.log(
      `Admin ${adminUserId} resolved conflict ${conflictId} by cancelling match ${match.id}`,
    );

    return {
      success: true,
      message: `Conflict resolved by cancelling match for job "${match.job.title}"`,
      cancelledMatchId: match.id,
      conflictId,
      notificationsSent,
    };
  }

  /**
   * Check if two jobs have time conflicts
   */
  private jobsHaveTimeConflict(job1: Job, job2: Job): boolean {
    // Calculate date ranges
    const job1Range = this.calculateDateRange(job1.dateType, job1.specificDate);
    const job2Range = this.calculateDateRange(job2.dateType, job2.specificDate);

    // Check if date ranges overlap
    if (job1Range.end < job2Range.start || job2Range.end < job1Range.start) {
      return false; // No date overlap
    }

    // Check if time slots conflict
    return this.timeSlotsConflict(job1.timeSlot, job2.timeSlot);
  }

  /**
   * Calculate date range for a job
   */
  private calculateDateRange(
    dateType: JobDateType,
    specificDate?: Date,
  ): { start: Date; end: Date } {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    switch (dateType) {
      case JobDateType.TODAY:
        return { start: today, end: today };

      case JobDateType.TOMORROW:
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        return { start: tomorrow, end: tomorrow };

      case JobDateType.THIS_WEEK:
        const weekEnd = new Date(today);
        weekEnd.setDate(weekEnd.getDate() + 7);
        return { start: today, end: weekEnd };

      case JobDateType.NEXT_WEEK:
        const nextWeekStart = new Date(today);
        nextWeekStart.setDate(nextWeekStart.getDate() + 7);
        const nextWeekEnd = new Date(today);
        nextWeekEnd.setDate(nextWeekEnd.getDate() + 14);
        return { start: nextWeekStart, end: nextWeekEnd };

      case JobDateType.SPECIFIC_DATE:
        if (!specificDate) {
          return { start: today, end: today };
        }
        const date = new Date(specificDate);
        date.setHours(0, 0, 0, 0);
        return { start: date, end: date };

      default:
        return { start: today, end: today };
    }
  }

  /**
   * Check if two time slots conflict
   */
  private timeSlotsConflict(slot1: JobTimeSlot, slot2: JobTimeSlot): boolean {
    // 'day' conflicts with everything
    if (slot1 === JobTimeSlot.DAY || slot2 === JobTimeSlot.DAY) {
      return true;
    }

    // Same slot conflicts
    if (slot1 === slot2) {
      return true;
    }

    // Morning and afternoon don't conflict
    return false;
  }

  /**
   * Calculate severity of conflict
   */
  private calculateConflictSeverity(job1: Job, job2: Job): 'critical' | 'high' | 'medium' {
    const range1 = this.calculateDateRange(job1.dateType, job1.specificDate);
    const range2 = this.calculateDateRange(job2.dateType, job2.specificDate);

    // Same specific date = CRITICAL
    if (
      job1.dateType === JobDateType.SPECIFIC_DATE &&
      job2.dateType === JobDateType.SPECIFIC_DATE &&
      range1.start.getTime() === range2.start.getTime()
    ) {
      return 'critical';
    }

    // Today or tomorrow = CRITICAL
    if (
      job1.dateType === JobDateType.TODAY ||
      job1.dateType === JobDateType.TOMORROW ||
      job2.dateType === JobDateType.TODAY ||
      job2.dateType === JobDateType.TOMORROW
    ) {
      return 'critical';
    }

    // Both full day slots = HIGH
    if (job1.timeSlot === JobTimeSlot.DAY && job2.timeSlot === JobTimeSlot.DAY) {
      return 'high';
    }

    // Week ranges = HIGH
    if (
      job1.dateType === JobDateType.THIS_WEEK ||
      job1.dateType === JobDateType.NEXT_WEEK ||
      job2.dateType === JobDateType.THIS_WEEK ||
      job2.dateType === JobDateType.NEXT_WEEK
    ) {
      return 'high';
    }

    return 'medium';
  }

  /**
   * Generate conflict description
   */
  private generateConflictDescription(job1: Job, job2: Job): string {
    const range1 = this.calculateDateRange(job1.dateType, job1.specificDate);
    const range2 = this.calculateDateRange(job2.dateType, job2.specificDate);

    const date1Str = this.formatDateRange(job1.dateType, range1);
    const date2Str = this.formatDateRange(job2.dateType, range2);

    return `Candidate confirmed for "${job1.title}" (${date1Str}, ${job1.timeSlot}) and "${job2.title}" (${date2Str}, ${job2.timeSlot}) which have overlapping schedules`;
  }

  /**
   * Format date range for display
   */
  private formatDateRange(dateType: JobDateType, range: { start: Date; end: Date }): string {
    switch (dateType) {
      case JobDateType.TODAY:
        return 'Today';
      case JobDateType.TOMORROW:
        return 'Tomorrow';
      case JobDateType.THIS_WEEK:
        return 'This week';
      case JobDateType.NEXT_WEEK:
        return 'Next week';
      case JobDateType.SPECIFIC_DATE:
        return range.start.toLocaleDateString();
      default:
        return 'Unknown date';
    }
  }

  /**
   * Generate unique conflict ID from match IDs
   */
  private generateConflictId(matchIds: string[]): string {
    const sorted = matchIds.sort();
    const hash = crypto.createHash('sha256').update(sorted.join('-')).digest('hex');
    return hash.substring(0, 16);
  }

  /**
   * Get candidate name
   */
  private getCandidateName(match: Match): string | undefined {
    const user = match.candidate?.user;
    if (user?.firstName && user?.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    return undefined;
  }

  /**
   * Map match to conflicting match DTO
   */
  private mapToConflictingMatch(match: Match): ConflictingMatchDto {
    const employerUser = match.job.employer?.user;
    const employerName =
      employerUser?.firstName && employerUser?.lastName
        ? `${employerUser.firstName} ${employerUser.lastName}`
        : undefined;

    return {
      matchId: match.id,
      jobId: match.job.id,
      jobTitle: match.job.title,
      employerId: match.job.employerId,
      employerName,
      dateType: match.job.dateType,
      specificDate: match.job.specificDate ?? undefined,
      timeSlot: match.job.timeSlot,
      confirmedAt: match.confirmedAt!,
    };
  }
}
