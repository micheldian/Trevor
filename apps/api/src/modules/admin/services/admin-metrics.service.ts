import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Request } from 'express';
import { User } from '../../users/entities/user.entity';
import { Profile } from '../../profiles/entities/profile.entity';
import { Job, JobStatus } from '../../jobs/entities/job.entity';
import { Match, MatchStatus } from '../../matches/entities/match.entity';
import { AuditLogService } from '../../audit-log/audit-log.service';
import { MetricsResponseDto, TopCultureDto, TopEmployerDto } from '../dto/metrics.dto';

@Injectable()
export class AdminMetricsService {
  private readonly logger = new Logger(AdminMetricsService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Profile)
    private readonly profileRepo: Repository<Profile>,
    @InjectRepository(Job)
    private readonly jobRepo: Repository<Job>,
    @InjectRepository(Match)
    private readonly matchRepo: Repository<Match>,
    private readonly auditLogService: AuditLogService,
  ) {}

  /**
   * Calculate all dashboard metrics
   */
  async getMetrics(adminUserId: string, request?: Request): Promise<MetricsResponseDto> {
    const calculatedAt = new Date();

    // Execute all queries in parallel for performance
    const [
      activeUsersLast7Days,
      newRegistrationsLast7Days,
      realTimeAvailabilityOn,
      totalJobsCreated,
      totalJobsConfirmed,
      confirmationRate,
      noShowRate,
      avgTimeToConfirmHours,
      topCultures,
      topEmployers,
    ] = await Promise.all([
      this.getActiveUsersLast7Days(),
      this.getNewRegistrationsLast7Days(),
      this.getRealTimeAvailabilityOn(),
      this.getTotalJobsCreated(),
      this.getTotalJobsConfirmed(),
      this.getConfirmationRate(),
      this.getNoShowRate(),
      this.getAvgTimeToConfirmHours(),
      this.getTopCultures(),
      this.getTopEmployers(),
    ]);

    // Audit log
    await this.auditLogService.create({
      actorUserId: adminUserId,
      action: 'ADMIN_VIEW_METRICS',
      entityType: 'metrics',
      entityId: undefined,
      beforeJson: undefined,
      afterJson: {
        activeUsersLast7Days,
        newRegistrationsLast7Days,
        realTimeAvailabilityOn,
        totalJobsCreated,
        totalJobsConfirmed,
        confirmationRate,
        noShowRate,
      },
      ipAddress: request?.ip,
      userAgent: request?.headers['user-agent'],
    });

    return {
      activeUsersLast7Days,
      newRegistrationsLast7Days,
      realTimeAvailabilityOn,
      totalJobsCreated,
      totalJobsConfirmed,
      confirmationRate,
      noShowRate,
      avgTimeToConfirmHours,
      topCultures,
      topEmployers,
      calculatedAt,
    };
  }

  /**
   * Count users active in the last 7 days
   * Active = users with updated_at in the last 7 days
   */
  private async getActiveUsersLast7Days(): Promise<number> {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const count = await this.userRepo
      .createQueryBuilder('user')
      .where('user.updatedAt >= :sevenDaysAgo', { sevenDaysAgo })
      .andWhere('user.isActive = :isActive', { isActive: true })
      .getCount();

    return count;
  }

  /**
   * Count new user registrations in the last 7 days
   */
  private async getNewRegistrationsLast7Days(): Promise<number> {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const count = await this.userRepo
      .createQueryBuilder('user')
      .where('user.createdAt >= :sevenDaysAgo', { sevenDaysAgo })
      .getCount();

    return count;
  }

  /**
   * Count profiles with real-time availability ON
   */
  private async getRealTimeAvailabilityOn(): Promise<number> {
    const count = await this.profileRepo
      .createQueryBuilder('profile')
      .where('profile.status = :status', { status: 'on' })
      .andWhere('profile.isActive = :isActive', { isActive: true })
      .getCount();

    return count;
  }

  /**
   * Count total jobs created
   */
  private async getTotalJobsCreated(): Promise<number> {
    const count = await this.jobRepo
      .createQueryBuilder('job')
      .where('job.isActive = :isActive', { isActive: true })
      .getCount();

    return count;
  }

  /**
   * Count total jobs confirmed
   */
  private async getTotalJobsConfirmed(): Promise<number> {
    const count = await this.jobRepo
      .createQueryBuilder('job')
      .where('job.status = :status', { status: JobStatus.CONFIRMED })
      .andWhere('job.isActive = :isActive', { isActive: true })
      .getCount();

    return count;
  }

  /**
   * Calculate confirmation rate (percentage of jobs that got confirmed)
   */
  private async getConfirmationRate(): Promise<number> {
    const result = await this.jobRepo
      .createQueryBuilder('job')
      .select('COUNT(*)', 'totalJobs')
      .addSelect(
        `SUM(CASE WHEN job.status = '${JobStatus.CONFIRMED}' OR job.status = '${JobStatus.COMPLETED}' THEN 1 ELSE 0 END)`,
        'confirmedJobs',
      )
      .where('job.isActive = :isActive', { isActive: true })
      .getRawOne();

    const totalJobs = parseInt(result.totalJobs, 10) || 0;
    const confirmedJobs = parseInt(result.confirmedJobs, 10) || 0;

    if (totalJobs === 0) {
      return 0;
    }

    return parseFloat(((confirmedJobs / totalJobs) * 100).toFixed(2));
  }

  /**
   * Calculate no-show rate (percentage of confirmed jobs that were cancelled)
   */
  private async getNoShowRate(): Promise<number> {
    const result = await this.jobRepo
      .createQueryBuilder('job')
      .select(
        `SUM(CASE WHEN job.status = '${JobStatus.CONFIRMED}' OR job.status = '${JobStatus.COMPLETED}' THEN 1 ELSE 0 END)`,
        'confirmedJobs',
      )
      .addSelect(
        `SUM(CASE WHEN job.status = '${JobStatus.CANCELLED}' AND job.confirmedAt IS NOT NULL THEN 1 ELSE 0 END)`,
        'cancelledAfterConfirmed',
      )
      .where('job.isActive = :isActive', { isActive: true })
      .getRawOne();

    const confirmedJobs = parseInt(result.confirmedJobs, 10) || 0;
    const cancelledAfterConfirmed = parseInt(result.cancelledAfterConfirmed, 10) || 0;

    if (confirmedJobs === 0) {
      return 0;
    }

    return parseFloat(((cancelledAfterConfirmed / confirmedJobs) * 100).toFixed(2));
  }

  /**
   * Calculate average time from job creation to confirmation in hours
   */
  private async getAvgTimeToConfirmHours(): Promise<number> {
    const result = await this.jobRepo
      .createQueryBuilder('job')
      .select(
        'AVG(EXTRACT(EPOCH FROM (job.confirmedAt - job.createdAt)) / 3600)',
        'avgHours',
      )
      .where('job.confirmedAt IS NOT NULL')
      .andWhere('job.isActive = :isActive', { isActive: true })
      .getRawOne();

    const avgHours = parseFloat(result.avgHours) || 0;
    return parseFloat(avgHours.toFixed(2));
  }

  /**
   * Get top 10 cultures/tags by usage
   */
  private async getTopCultures(): Promise<TopCultureDto[]> {
    const results = await this.jobRepo
      .createQueryBuilder('job')
      .select('unnest(job.tags)', 'culture')
      .addSelect('COUNT(*)', 'count')
      .where('job.isActive = :isActive', { isActive: true })
      .andWhere('array_length(job.tags, 1) > 0')
      .groupBy('culture')
      .orderBy('count', 'DESC')
      .limit(10)
      .getRawMany();

    return results.map((r) => ({
      culture: r.culture,
      count: parseInt(r.count, 10),
    }));
  }

  /**
   * Get top 10 employers by job count
   */
  private async getTopEmployers(): Promise<TopEmployerDto[]> {
    const results = await this.jobRepo
      .createQueryBuilder('job')
      .leftJoin('job.employer', 'employer')
      .leftJoin('employer.user', 'employerUser')
      .select('job.employerId', 'employerId')
      .addSelect(
        `CONCAT(employerUser.firstName, ' ', employerUser.lastName)`,
        'employerName',
      )
      .addSelect('COUNT(*)', 'jobCount')
      .addSelect(
        `SUM(CASE WHEN job.status = '${JobStatus.CONFIRMED}' OR job.status = '${JobStatus.COMPLETED}' THEN 1 ELSE 0 END)`,
        'confirmedJobCount',
      )
      .where('job.isActive = :isActive', { isActive: true })
      .groupBy('job.employerId')
      .addGroupBy('employerUser.firstName')
      .addGroupBy('employerUser.lastName')
      .orderBy('jobCount', 'DESC')
      .limit(10)
      .getRawMany();

    return results.map((r) => ({
      employerId: r.employerId,
      employerName: r.employerName !== ' ' ? r.employerName : undefined,
      jobCount: parseInt(r.jobCount, 10),
      confirmedJobCount: parseInt(r.confirmedJobCount, 10),
    }));
  }
}
