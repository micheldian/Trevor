import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Brackets } from 'typeorm';
import { Request } from 'express';
import { Match, MatchStatus } from '../../matches/entities/match.entity';
import { Job } from '../../jobs/entities/job.entity';
import { AuditLogService } from '../../audit-log/audit-log.service';
import { GetMatchesQueryDto } from '../dto/get-matches-query.dto';
import {
  AdminMatchResponseDto,
  GetMatchesResponseDto,
  AdminMatchJobDto,
  AdminMatchCandidateDto,
  RiskFactorsDto,
} from '../dto/admin-match-response.dto';

interface MatchDuplicationInfo {
  jobId: string;
  candidateId: string;
  matchCount: number;
  confirmedCount: number;
}

@Injectable()
export class AdminMatchesService {
  private readonly logger = new Logger(AdminMatchesService.name);

  constructor(
    @InjectRepository(Match)
    private readonly matchRepo: Repository<Match>,
    @InjectRepository(Job)
    private readonly jobRepo: Repository<Job>,
    private readonly auditLogService: AuditLogService,
  ) {}

  /**
   * Get matches with comprehensive filters and risk scoring
   */
  async getMatches(
    dto: GetMatchesQueryDto,
    adminUserId: string,
    request?: Request,
  ): Promise<GetMatchesResponseDto> {
    const {
      status,
      jobId,
      candidateId,
      employerId,
      createdAfter,
      createdBefore,
      minRiskScore,
      limit = 20,
      offset = 0,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
    } = dto;

    // Build base query
    const qb = this.matchRepo
      .createQueryBuilder('match')
      .leftJoinAndSelect('match.job', 'job')
      .leftJoinAndSelect('job.employer', 'employer')
      .leftJoinAndSelect('employer.user', 'employerUser')
      .leftJoinAndSelect('match.candidate', 'candidate')
      .leftJoinAndSelect('candidate.user', 'candidateUser');

    // Filter by status
    if (status) {
      qb.andWhere('match.status = :status', { status });
    }

    // Filter by job ID
    if (jobId) {
      qb.andWhere('match.jobId = :jobId', { jobId });
    }

    // Filter by candidate ID
    if (candidateId) {
      qb.andWhere('match.candidateId = :candidateId', { candidateId });
    }

    // Filter by employer ID
    if (employerId) {
      qb.andWhere('job.employerId = :employerId', { employerId });
    }

    // Filter by created_at range
    if (createdAfter) {
      qb.andWhere('match.createdAt >= :createdAfter', {
        createdAfter: new Date(createdAfter),
      });
    }
    if (createdBefore) {
      qb.andWhere('match.createdAt <= :createdBefore', {
        createdBefore: new Date(createdBefore),
      });
    }

    // Sorting
    const allowedSortFields = ['createdAt', 'updatedAt'];
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';
    const sortDirection = sortOrder === 'ASC' ? 'ASC' : 'DESC';

    qb.orderBy(`match.${sortField}`, sortDirection);

    // Get total count
    const total = await qb.getCount();

    // Get paginated results
    const matches = await qb.skip(offset).take(limit).getMany();

    // Get duplication info for all matches
    const jobIds = [...new Set(matches.map((m) => m.jobId))];
    const candidateIds = [...new Set(matches.map((m) => m.candidateId))];
    const duplicationInfo = await this.getDuplicationInfo(jobIds, candidateIds);

    // Calculate risk scores and map to DTOs
    const data: AdminMatchResponseDto[] = [];
    let highRiskCount = 0;

    for (const match of matches) {
      const riskData = this.calculateRiskScore(match, duplicationInfo);
      const dto = this.mapToDto(match, riskData.score, riskData.factors);

      // Apply risk score filter if specified
      if (minRiskScore !== undefined && dto.riskScore < minRiskScore) {
        continue;
      }

      if (dto.riskScore >= 50) {
        highRiskCount++;
      }

      data.push(dto);
    }

    // Sort by risk score if requested
    if (sortBy === 'riskScore') {
      data.sort((a, b) => {
        return sortDirection === 'ASC'
          ? a.riskScore - b.riskScore
          : b.riskScore - a.riskScore;
      });
    }

    // Audit log
    await this.auditLogService.create({
      actorUserId: adminUserId,
      action: 'ADMIN_VIEW_MATCHES',
      entityType: 'matches',
      entityId: undefined,
      beforeJson: undefined,
      afterJson: {
        filters: dto,
        resultCount: data.length,
        total,
        highRiskCount,
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
        highRiskCount,
      },
    };
  }

  /**
   * Get duplication information for jobs and candidates
   */
  private async getDuplicationInfo(
    jobIds: string[],
    candidateIds: string[],
  ): Promise<Map<string, MatchDuplicationInfo>> {
    if (jobIds.length === 0 || candidateIds.length === 0) {
      return new Map();
    }

    // Query to find duplicate matches and multiple confirmations
    const duplicates = await this.matchRepo
      .createQueryBuilder('match')
      .select('match.jobId', 'jobId')
      .addSelect('match.candidateId', 'candidateId')
      .addSelect('COUNT(*)', 'matchCount')
      .addSelect(
        `SUM(CASE WHEN match.status = '${MatchStatus.CONFIRMED}' THEN 1 ELSE 0 END)`,
        'confirmedCount',
      )
      .where('match.jobId IN (:...jobIds)', { jobIds })
      .andWhere('match.candidateId IN (:...candidateIds)', { candidateIds })
      .andWhere('match.isActive = :isActive', { isActive: true })
      .groupBy('match.jobId')
      .addGroupBy('match.candidateId')
      .getRawMany();

    const infoMap = new Map<string, MatchDuplicationInfo>();

    for (const row of duplicates) {
      const key = `${row.jobId}:${row.candidateId}`;
      infoMap.set(key, {
        jobId: row.jobId,
        candidateId: row.candidateId,
        matchCount: parseInt(row.matchCount, 10),
        confirmedCount: parseInt(row.confirmedCount, 10),
      });
    }

    return infoMap;
  }

  /**
   * Calculate risk score and factors for a match
   */
  private calculateRiskScore(
    match: Match,
    duplicationInfo: Map<string, MatchDuplicationInfo>,
  ): { score: number; factors: RiskFactorsDto } {
    const now = new Date();
    const daysSinceCreated = Math.floor(
      (now.getTime() - match.createdAt.getTime()) / (1000 * 60 * 60 * 24),
    );
    const daysSinceUpdate = Math.floor(
      (now.getTime() - match.updatedAt.getTime()) / (1000 * 60 * 60 * 24),
    );

    const key = `${match.jobId}:${match.candidateId}`;
    const dupInfo = duplicationInfo.get(key);

    // Calculate risk factors
    const duplicateMatch = dupInfo ? dupInfo.matchCount > 1 : false;
    const multipleConfirmed = dupInfo ? dupInfo.confirmedCount > 1 : false;

    // No response: Match in discussed/interested status for >7 days without update
    const noResponse =
      (match.status === MatchStatus.DISCUSSED || match.status === MatchStatus.INTERESTED) &&
      daysSinceUpdate > 7;

    // Contacted but no progress: WhatsApp contacted >3 days ago but still in early status
    const contactedNoProgress =
      match.whatsappContacted &&
      match.whatsappContactedAt !== null &&
      match.whatsappContactedAt !== undefined &&
      (match.status === MatchStatus.DISCUSSED || match.status === MatchStatus.INTERESTED) &&
      Math.floor(
        (now.getTime() - match.whatsappContactedAt.getTime()) / (1000 * 60 * 60 * 24),
      ) > 3;

    const factors: RiskFactorsDto = {
      duplicateMatch,
      multipleConfirmed,
      noResponse,
      contactedNoProgress,
      daysSinceCreated,
      daysSinceUpdate,
    };

    // Calculate score (0-100)
    let score = 0;

    if (multipleConfirmed) {
      score += 50; // CRITICAL: Multiple confirmed matches for same job
    }

    if (duplicateMatch) {
      score += 40; // HIGH: Duplicate match entries
    }

    if (noResponse) {
      score += 30; // MEDIUM: No response after initial contact
    }

    if (contactedNoProgress) {
      score += 20; // MEDIUM: Contacted but no progression
    }

    // Stale matches (>30 days without update)
    if (daysSinceUpdate > 30 && match.status !== MatchStatus.COMPLETED) {
      score += 10;
    }

    // Cap at 100
    score = Math.min(score, 100);

    return { score, factors };
  }

  /**
   * Map Match entity to AdminMatchResponseDto
   */
  private mapToDto(
    match: Match,
    riskScore: number,
    riskFactors: RiskFactorsDto,
  ): AdminMatchResponseDto {
    const jobDto: AdminMatchJobDto = {
      id: match.job.id,
      title: match.job.title,
      employerId: match.job.employerId,
      employerName:
        match.job.employer?.user?.firstName && match.job.employer?.user?.lastName
          ? `${match.job.employer.user.firstName} ${match.job.employer.user.lastName}`
          : undefined,
      status: match.job.status,
    };

    const candidateDto: AdminMatchCandidateDto = {
      id: match.candidate.id,
      userId: match.candidate.userId,
      firstName: match.candidate.user?.firstName ?? undefined,
      lastName: match.candidate.user?.lastName ?? undefined,
      city: match.candidate.city ?? undefined,
      type: match.candidate.type,
    };

    return {
      id: match.id,
      jobId: match.jobId,
      job: jobDto,
      candidateId: match.candidateId,
      candidate: candidateDto,
      status: match.status,
      employerNotes: match.employerNotes ?? undefined,
      candidateNotes: match.candidateNotes ?? undefined,
      whatsappContacted: match.whatsappContacted,
      whatsappContactedAt: match.whatsappContactedAt ?? undefined,
      isActive: match.isActive,
      createdAt: match.createdAt,
      updatedAt: match.updatedAt,
      interestedAt: match.interestedAt ?? undefined,
      rejectedAt: match.rejectedAt ?? undefined,
      confirmedAt: match.confirmedAt ?? undefined,
      completedAt: match.completedAt ?? undefined,
      riskScore,
      riskFactors,
    };
  }
}
