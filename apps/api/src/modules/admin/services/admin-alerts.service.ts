import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Request } from 'express';
import { User } from '../../users/entities/user.entity';
import { Profile } from '../../profiles/entities/profile.entity';
import { Job, JobStatus } from '../../jobs/entities/job.entity';
import { Match, MatchStatus } from '../../matches/entities/match.entity';
import { Review } from '../../reviews/entities/review.entity';
import { AuditLogService } from '../../audit-log/audit-log.service';
import {
  GetAlertsResponseDto,
  HighCancellationEmployerAlertDto,
  NoShowWorkerAlertDto,
  UnfulfilledDemandAlertDto,
  NegativeReviewsTrendAlertDto,
} from '../dto/alerts.dto';

@Injectable()
export class AdminAlertsService {
  private readonly logger = new Logger(AdminAlertsService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Profile)
    private readonly profileRepo: Repository<Profile>,
    @InjectRepository(Job)
    private readonly jobRepo: Repository<Job>,
    @InjectRepository(Match)
    private readonly matchRepo: Repository<Match>,
    @InjectRepository(Review)
    private readonly reviewRepo: Repository<Review>,
    private readonly auditLogService: AuditLogService,
  ) {}

  /**
   * Detect all alerts across the platform
   */
  async getAlerts(adminUserId: string, request?: Request): Promise<GetAlertsResponseDto> {
    const detectedAt = new Date();

    // Execute all alert detection in parallel
    const [
      highCancellationEmployers,
      noShowWorkers,
      unfulfilledDemand,
      negativeReviewsTrend,
    ] = await Promise.all([
      this.detectHighCancellationEmployers(detectedAt),
      this.detectNoShowWorkers(detectedAt),
      this.detectUnfulfilledDemand(detectedAt),
      this.detectNegativeReviewsTrend(detectedAt),
    ]);

    // Count critical and high severity alerts
    const criticalAlertsCount =
      highCancellationEmployers.filter((a) => a.severity === 'critical').length +
      noShowWorkers.filter((a) => a.severity === 'critical').length +
      (unfulfilledDemand?.severity === 'critical' ? 1 : 0) +
      (negativeReviewsTrend?.severity === 'critical' ? 1 : 0);

    const highAlertsCount =
      highCancellationEmployers.filter((a) => a.severity === 'high').length +
      noShowWorkers.filter((a) => a.severity === 'high').length +
      (unfulfilledDemand?.severity === 'high' ? 1 : 0) +
      (negativeReviewsTrend?.severity === 'high' ? 1 : 0);

    // Audit log
    await this.auditLogService.create({
      actorUserId: adminUserId,
      action: 'ADMIN_VIEW_ALERTS',
      entityType: 'alerts',
      entityId: undefined,
      beforeJson: undefined,
      afterJson: {
        criticalAlertsCount,
        highAlertsCount,
        highCancellationEmployersCount: highCancellationEmployers.length,
        noShowWorkersCount: noShowWorkers.length,
        hasUnfulfilledDemandAlert: unfulfilledDemand !== null,
        hasNegativeReviewsTrendAlert: negativeReviewsTrend !== null,
      },
      ipAddress: request?.ip,
      userAgent: request?.headers['user-agent'],
    });

    return {
      highCancellationEmployers,
      noShowWorkers,
      unfulfilledDemand,
      negativeReviewsTrend,
      criticalAlertsCount,
      highAlertsCount,
      detectedAt,
    };
  }

  /**
   * Detect employers with high cancellation rates
   * Rules:
   * - Employers with >= 3 cancelled jobs in last 30 days
   * - OR cancellation rate > 30%
   * - Severity: critical (>50%), high (30-50%), medium (<30%)
   */
  private async detectHighCancellationEmployers(
    detectedAt: Date,
  ): Promise<HighCancellationEmployerAlertDto[]> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Query to find employers with cancellations
    const results = await this.jobRepo
      .createQueryBuilder('job')
      .leftJoin('job.employer', 'employer')
      .leftJoin('employer.user', 'employerUser')
      .select('job.employerId', 'employerId')
      .addSelect(
        `CONCAT(employerUser.firstName, ' ', employerUser.lastName)`,
        'employerName',
      )
      .addSelect('COUNT(*)', 'totalJobs')
      .addSelect(
        `SUM(CASE WHEN job.status = '${JobStatus.CANCELLED}' THEN 1 ELSE 0 END)`,
        'cancelledJobs',
      )
      .where('job.createdAt >= :thirtyDaysAgo', { thirtyDaysAgo })
      .andWhere('job.isActive = :isActive', { isActive: true })
      .groupBy('job.employerId')
      .addGroupBy('employerUser.firstName')
      .addGroupBy('employerUser.lastName')
      .getRawMany();

    const alerts: HighCancellationEmployerAlertDto[] = [];

    for (const row of results) {
      const totalJobs = parseInt(row.totalJobs, 10);
      const cancelledJobs = parseInt(row.cancelledJobs, 10);
      const cancellationRate = totalJobs > 0 ? (cancelledJobs / totalJobs) * 100 : 0;

      // Filter: >= 3 cancellations OR rate > 30%
      if (cancelledJobs >= 3 || cancellationRate > 30) {
        let severity: 'critical' | 'high' | 'medium' = 'medium';
        if (cancellationRate > 50) {
          severity = 'critical';
        } else if (cancellationRate >= 30) {
          severity = 'high';
        }

        alerts.push({
          employerId: row.employerId,
          employerName: row.employerName !== ' ' ? row.employerName : undefined,
          totalJobs,
          cancelledJobs,
          cancellationRate: parseFloat(cancellationRate.toFixed(2)),
          severity,
          detectedAt,
        });
      }
    }

    // Sort by cancellation rate descending
    alerts.sort((a, b) => b.cancellationRate - a.cancellationRate);

    return alerts;
  }

  /**
   * Detect workers with multiple no-shows
   * Rules:
   * - Candidates with >= 2 no-shows (confirmed matches that were cancelled)
   * - No-show = match with confirmedAt NOT NULL and status = REJECTED
   * - Severity: critical (>=3), high (2)
   */
  private async detectNoShowWorkers(detectedAt: Date): Promise<NoShowWorkerAlertDto[]> {
    // Query to find candidates with no-shows
    const results = await this.matchRepo
      .createQueryBuilder('match')
      .leftJoin('match.candidate', 'candidate')
      .leftJoin('candidate.user', 'candidateUser')
      .select('match.candidateId', 'candidateId')
      .addSelect(
        `CONCAT(candidateUser.firstName, ' ', candidateUser.lastName)`,
        'candidateName',
      )
      .addSelect('candidate.city', 'city')
      .addSelect(
        `SUM(CASE WHEN match.confirmedAt IS NOT NULL THEN 1 ELSE 0 END)`,
        'totalConfirmed',
      )
      .addSelect(
        `SUM(CASE WHEN match.confirmedAt IS NOT NULL AND match.status = '${MatchStatus.REJECTED}' THEN 1 ELSE 0 END)`,
        'noShowCount',
      )
      .where('match.isActive = :isActive', { isActive: true })
      .groupBy('match.candidateId')
      .addGroupBy('candidateUser.firstName')
      .addGroupBy('candidateUser.lastName')
      .addGroupBy('candidate.city')
      .having(
        `SUM(CASE WHEN match.confirmedAt IS NOT NULL AND match.status = '${MatchStatus.REJECTED}' THEN 1 ELSE 0 END) >= 2`,
      )
      .getRawMany();

    const alerts: NoShowWorkerAlertDto[] = [];

    for (const row of results) {
      const totalConfirmed = parseInt(row.totalConfirmed, 10);
      const noShowCount = parseInt(row.noShowCount, 10);
      const noShowRate = totalConfirmed > 0 ? (noShowCount / totalConfirmed) * 100 : 0;

      const severity: 'critical' | 'high' = noShowCount >= 3 ? 'critical' : 'high';

      alerts.push({
        candidateId: row.candidateId,
        candidateName: row.candidateName !== ' ' ? row.candidateName : undefined,
        city: row.city ?? undefined,
        totalConfirmed,
        noShowCount,
        noShowRate: parseFloat(noShowRate.toFixed(2)),
        severity,
        detectedAt,
      });
    }

    // Sort by no-show count descending
    alerts.sort((a, b) => b.noShowCount - a.noShowCount);

    return alerts;
  }

  /**
   * Detect unfulfilled demand spikes
   * Rules:
   * - Jobs without confirmed matches for > 48 hours
   * - Compare last 7 days to previous 7 days
   * - Severity: critical (>50% increase), high (20-50%), medium (<20%)
   */
  private async detectUnfulfilledDemand(
    detectedAt: Date,
  ): Promise<UnfulfilledDemandAlertDto | null> {
    const now = new Date();
    const fortyEightHoursAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    // Count unfulfilled jobs (no confirmed matches) for > 48h
    const totalUnfulfilledJobs = await this.jobRepo
      .createQueryBuilder('job')
      .leftJoin('job.matches', 'match', `match.status = '${MatchStatus.CONFIRMED}'`)
      .where('job.createdAt <= :fortyEightHoursAgo', { fortyEightHoursAgo })
      .andWhere('job.status != :completed', { completed: JobStatus.COMPLETED })
      .andWhere('job.status != :cancelled', { cancelled: JobStatus.CANCELLED })
      .andWhere('job.isActive = :isActive', { isActive: true })
      .andWhere('match.id IS NULL') // No confirmed matches
      .getCount();

    // Count unfulfilled jobs created in last 7 days
    const recentUnfulfilledJobs = await this.jobRepo
      .createQueryBuilder('job')
      .leftJoin('job.matches', 'match', `match.status = '${MatchStatus.CONFIRMED}'`)
      .where('job.createdAt >= :sevenDaysAgo', { sevenDaysAgo })
      .andWhere('job.createdAt <= :fortyEightHoursAgo', { fortyEightHoursAgo })
      .andWhere('job.status != :completed', { completed: JobStatus.COMPLETED })
      .andWhere('job.status != :cancelled', { cancelled: JobStatus.CANCELLED })
      .andWhere('job.isActive = :isActive', { isActive: true })
      .andWhere('match.id IS NULL')
      .getCount();

    // Count unfulfilled jobs in previous 7 days (8-14 days ago)
    const previousUnfulfilledJobs = await this.jobRepo
      .createQueryBuilder('job')
      .leftJoin('job.matches', 'match', `match.status = '${MatchStatus.CONFIRMED}'`)
      .where('job.createdAt >= :fourteenDaysAgo', { fourteenDaysAgo })
      .andWhere('job.createdAt < :sevenDaysAgo', { sevenDaysAgo })
      .andWhere('job.status != :completed', { completed: JobStatus.COMPLETED })
      .andWhere('job.status != :cancelled', { cancelled: JobStatus.CANCELLED })
      .andWhere('job.isActive = :isActive', { isActive: true })
      .andWhere('match.id IS NULL')
      .getCount();

    // Calculate increase percentage
    const increasePercentage =
      previousUnfulfilledJobs > 0
        ? ((recentUnfulfilledJobs - previousUnfulfilledJobs) / previousUnfulfilledJobs) * 100
        : recentUnfulfilledJobs > 0
          ? 100
          : 0;

    // Only create alert if there's a significant increase (>10%)
    if (increasePercentage <= 10 && totalUnfulfilledJobs < 5) {
      return null;
    }

    // Get most affected cultures
    const cultureResults = await this.jobRepo
      .createQueryBuilder('job')
      .leftJoin('job.matches', 'match', `match.status = '${MatchStatus.CONFIRMED}'`)
      .select('unnest(job.tags)', 'culture')
      .addSelect('COUNT(*)', 'count')
      .where('job.createdAt <= :fortyEightHoursAgo', { fortyEightHoursAgo })
      .andWhere('job.status != :completed', { completed: JobStatus.COMPLETED })
      .andWhere('job.status != :cancelled', { cancelled: JobStatus.CANCELLED })
      .andWhere('job.isActive = :isActive', { isActive: true })
      .andWhere('match.id IS NULL')
      .andWhere('array_length(job.tags, 1) > 0')
      .groupBy('culture')
      .orderBy('count', 'DESC')
      .limit(5)
      .getRawMany();

    const affectedCultures = cultureResults.map((r) => r.culture);

    // Get most affected locations (cities)
    const locationResults = await this.jobRepo
      .createQueryBuilder('job')
      .leftJoin('job.matches', 'match', `match.status = '${MatchStatus.CONFIRMED}'`)
      .leftJoin('job.employer', 'employer')
      .select('employer.city', 'city')
      .addSelect('COUNT(*)', 'count')
      .where('job.createdAt <= :fortyEightHoursAgo', { fortyEightHoursAgo })
      .andWhere('job.status != :completed', { completed: JobStatus.COMPLETED })
      .andWhere('job.status != :cancelled', { cancelled: JobStatus.CANCELLED })
      .andWhere('job.isActive = :isActive', { isActive: true })
      .andWhere('match.id IS NULL')
      .andWhere('employer.city IS NOT NULL')
      .groupBy('employer.city')
      .orderBy('count', 'DESC')
      .limit(5)
      .getRawMany();

    const affectedLocations = locationResults.map((r) => r.city);

    // Determine severity
    let severity: 'critical' | 'high' | 'medium' = 'medium';
    if (increasePercentage > 50) {
      severity = 'critical';
    } else if (increasePercentage >= 20) {
      severity = 'high';
    }

    return {
      totalUnfulfilledJobs,
      recentUnfulfilledJobs,
      increasePercentage: parseFloat(increasePercentage.toFixed(2)),
      affectedCultures,
      affectedLocations,
      severity,
      detectedAt,
    };
  }

  /**
   * Detect negative reviews trend
   * Rules:
   * - Reviews with rating <= 2 stars
   * - Compare last 7 days to previous 7 days
   * - Severity: critical (>100% increase), high (50-100%), medium (<50%)
   */
  private async detectNegativeReviewsTrend(
    detectedAt: Date,
  ): Promise<NegativeReviewsTrendAlertDto | null> {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    // Count negative reviews in last 7 days
    const last7DaysCount = await this.reviewRepo
      .createQueryBuilder('review')
      .where('review.createdAt >= :sevenDaysAgo', { sevenDaysAgo })
      .andWhere('review.rating <= 2')
      .andWhere('review.isVisible = :isVisible', { isVisible: true })
      .getCount();

    // Count negative reviews in previous 7 days
    const previous7DaysCount = await this.reviewRepo
      .createQueryBuilder('review')
      .where('review.createdAt >= :fourteenDaysAgo', { fourteenDaysAgo })
      .andWhere('review.createdAt < :sevenDaysAgo', { sevenDaysAgo })
      .andWhere('review.rating <= 2')
      .andWhere('review.isVisible = :isVisible', { isVisible: true })
      .getCount();

    // Calculate increase percentage
    const increasePercentage =
      previous7DaysCount > 0
        ? ((last7DaysCount - previous7DaysCount) / previous7DaysCount) * 100
        : last7DaysCount > 0
          ? 100
          : 0;

    // Only create alert if there's an increase
    if (increasePercentage <= 0 && last7DaysCount < 3) {
      return null;
    }

    // Calculate average rating in last 7 days
    const avgResult = await this.reviewRepo
      .createQueryBuilder('review')
      .select('AVG(review.rating)', 'avgRating')
      .where('review.createdAt >= :sevenDaysAgo', { sevenDaysAgo })
      .andWhere('review.isVisible = :isVisible', { isVisible: true })
      .getRawOne();

    const avgRatingLast7Days = parseFloat(avgResult?.avgRating) || 0;

    // Extract common words from negative review comments
    const negativeReviews = await this.reviewRepo
      .createQueryBuilder('review')
      .select('review.comment')
      .where('review.createdAt >= :sevenDaysAgo', { sevenDaysAgo })
      .andWhere('review.rating <= 2')
      .andWhere('review.isVisible = :isVisible', { isVisible: true })
      .andWhere('review.comment IS NOT NULL')
      .andWhere(`review.comment != ''`)
      .getMany();

    // Simple keyword extraction (common negative words)
    const keywords = new Map<string, number>();
    const commonWords = [
      'late',
      'no-show',
      'rude',
      'unprofessional',
      'slow',
      'poor',
      'bad',
      'terrible',
      'awful',
      'disappointing',
      'cancel',
      'cancelled',
    ];

    for (const review of negativeReviews) {
      const comment = review.comment?.toLowerCase() || '';
      for (const word of commonWords) {
        if (comment.includes(word)) {
          keywords.set(word, (keywords.get(word) || 0) + 1);
        }
      }
    }

    // Get top 3 most common reasons
    const topNegativeReasons = Array.from(keywords.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map((entry) => entry[0]);

    // Determine severity
    let severity: 'critical' | 'high' | 'medium' = 'medium';
    if (increasePercentage > 100) {
      severity = 'critical';
    } else if (increasePercentage >= 50) {
      severity = 'high';
    }

    return {
      last7DaysCount,
      previous7DaysCount,
      increasePercentage: parseFloat(increasePercentage.toFixed(2)),
      avgRatingLast7Days: parseFloat(avgRatingLast7Days.toFixed(2)),
      topNegativeReasons,
      severity,
      detectedAt,
    };
  }
}
