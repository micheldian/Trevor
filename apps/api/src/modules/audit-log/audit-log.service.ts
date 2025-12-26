import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from './entities/audit-log.entity';
import { Request } from 'express';

/**
 * DTO for creating audit logs
 */
export interface CreateAuditLogDto {
  actorUserId?: string;
  action: string;
  entityType: string;
  entityId?: string;
  beforeJson?: Record<string, any>;
  afterJson?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  requestMethod?: string;
  requestUrl?: string;
  metadata?: Record<string, any>;
  status?: 'success' | 'failed' | 'partial';
  errorMessage?: string;
}

@Injectable()
export class AuditLogService {
  private readonly logger = new Logger(AuditLogService.name);

  constructor(
    @InjectRepository(AuditLog)
    private readonly auditLogRepository: Repository<AuditLog>,
  ) {}

  /**
   * Create an audit log entry
   */
  async create(dto: CreateAuditLogDto): Promise<AuditLog | null> {
    try {
      const auditLog = this.auditLogRepository.create(dto);
      await this.auditLogRepository.save(auditLog);

      this.logger.log(
        `Audit log created: ${dto.action} on ${dto.entityType}:${dto.entityId} by user ${dto.actorUserId}`,
      );

      return auditLog;
    } catch (error) {
      this.logger.error('Failed to create audit log', error);
      // Don't throw - audit logging should never break the main flow
      return null;
    }
  }

  /**
   * Helper to extract request metadata
   */
  extractRequestMetadata(request: Request): {
    ipAddress: string;
    userAgent: string;
    requestMethod: string;
    requestUrl: string;
  } {
    return {
      ipAddress: this.getClientIp(request),
      userAgent: request.headers['user-agent'] || 'Unknown',
      requestMethod: request.method,
      requestUrl: request.url,
    };
  }

  /**
   * Get client IP address (handles proxies)
   */
  private getClientIp(request: Request): string {
    const forwarded = request.headers['x-forwarded-for'];
    if (forwarded) {
      return Array.isArray(forwarded)
        ? forwarded[0]
        : forwarded.split(',')[0].trim();
    }
    return request.ip || request.socket?.remoteAddress || 'Unknown';
  }

  /**
   * Log user verification action
   */
  async logUserVerification(
    actorUserId: string,
    targetUserId: string,
    before: any,
    after: any,
    request?: Request,
  ): Promise<void> {
    const metadata = request ? this.extractRequestMetadata(request) : {};

    await this.create({
      actorUserId,
      action: 'user.verified',
      entityType: 'user',
      entityId: targetUserId,
      beforeJson: before,
      afterJson: after,
      ...metadata,
      metadata: {
        description: 'Admin verified user account',
      },
    });
  }

  /**
   * Log user suspension action
   */
  async logUserSuspension(
    actorUserId: string,
    targetUserId: string,
    reason: string,
    before: any,
    after: any,
    request?: Request,
  ): Promise<void> {
    const metadata = request ? this.extractRequestMetadata(request) : {};

    await this.create({
      actorUserId,
      action: 'user.suspended',
      entityType: 'user',
      entityId: targetUserId,
      beforeJson: before,
      afterJson: after,
      ...metadata,
      metadata: {
        reason,
        description: 'Admin suspended user account',
      },
    });
  }

  /**
   * Log review deletion action
   */
  async logReviewDeletion(
    actorUserId: string,
    reviewId: string,
    reviewData: any,
    reason: string,
    request?: Request,
  ): Promise<void> {
    const metadata = request ? this.extractRequestMetadata(request) : {};

    await this.create({
      actorUserId,
      action: 'review.deleted',
      entityType: 'review',
      entityId: reviewId,
      beforeJson: reviewData,
      afterJson: { isActive: false, deletedAt: new Date() },
      ...metadata,
      metadata: {
        reason,
        description: 'Admin deleted review',
      },
    });
  }

  /**
   * Log job cancellation action
   */
  async logJobCancellation(
    actorUserId: string,
    jobId: string,
    reason: string,
    before: any,
    after: any,
    request?: Request,
  ): Promise<void> {
    const metadata = request ? this.extractRequestMetadata(request) : {};

    await this.create({
      actorUserId,
      action: 'job.cancelled',
      entityType: 'job',
      entityId: jobId,
      beforeJson: before,
      afterJson: after,
      ...metadata,
      metadata: {
        reason,
        description: 'Job cancelled',
      },
    });
  }

  /**
   * Log match confirmation action
   */
  async logMatchConfirmation(
    actorUserId: string,
    matchId: string,
    before: any,
    after: any,
    request?: Request,
  ): Promise<void> {
    const metadata = request ? this.extractRequestMetadata(request) : {};

    await this.create({
      actorUserId,
      action: 'match.confirmed',
      entityType: 'match',
      entityId: matchId,
      beforeJson: before,
      afterJson: after,
      ...metadata,
      metadata: {
        description: 'Match confirmed by employer',
        jobId: after.jobId,
        candidateId: after.candidateId,
      },
    });
  }

  /**
   * Log role change action
   */
  async logRoleChange(
    actorUserId: string,
    targetUserId: string,
    oldRole: string,
    newRole: string,
    request?: Request,
  ): Promise<void> {
    const metadata = request ? this.extractRequestMetadata(request) : {};

    await this.create({
      actorUserId,
      action: 'user.role_changed',
      entityType: 'user',
      entityId: targetUserId,
      beforeJson: { role: oldRole },
      afterJson: { role: newRole },
      ...metadata,
      metadata: {
        description: `User role changed from ${oldRole} to ${newRole}`,
      },
    });
  }

  /**
   * Generic action logger
   */
  async logAction(
    action: string,
    entityType: string,
    entityId: string,
    actorUserId?: string,
    before?: any,
    after?: any,
    request?: Request,
    metadata?: Record<string, any>,
  ): Promise<void> {
    const requestMetadata = request ? this.extractRequestMetadata(request) : {};

    await this.create({
      actorUserId,
      action,
      entityType,
      entityId,
      beforeJson: before,
      afterJson: after,
      ...requestMetadata,
      metadata,
    });
  }

  /**
   * Get audit logs for a specific entity
   */
  async findByEntity(
    entityType: string,
    entityId: string,
  ): Promise<AuditLog[]> {
    return this.auditLogRepository.find({
      where: { entityType, entityId },
      order: { createdAt: 'DESC' },
      relations: ['actor'],
      take: 100, // Limit for performance
    });
  }

  /**
   * Get audit logs for a specific user (actor)
   */
  async findByActor(actorUserId: string): Promise<AuditLog[]> {
    return this.auditLogRepository.find({
      where: { actorUserId },
      order: { createdAt: 'DESC' },
      relations: ['actor'],
      take: 100,
    });
  }

  /**
   * Get recent audit logs
   */
  async findRecent(limit: number = 50): Promise<AuditLog[]> {
    return this.auditLogRepository.find({
      order: { createdAt: 'DESC' },
      relations: ['actor'],
      take: limit,
    });
  }

  /**
   * Get audit logs by action type
   */
  async findByAction(action: string): Promise<AuditLog[]> {
    return this.auditLogRepository.find({
      where: { action },
      order: { createdAt: 'DESC' },
      relations: ['actor'],
      take: 100,
    });
  }
}
