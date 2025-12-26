import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { AuditLogService } from '../audit-log.service';
import { AUDIT_LOG_KEY, AuditLogConfig } from '../decorators/audit-log.decorator';

/**
 * Interceptor to automatically create audit logs for decorated methods
 *
 * This interceptor:
 * - Reads @AuditLog() metadata
 * - Captures method parameters (before)
 * - Captures method result (after)
 * - Extracts request metadata (IP, user agent, etc.)
 * - Creates audit log entry
 *
 * Usage: Apply globally or per-controller
 */
@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  private readonly logger = new Logger(AuditLogInterceptor.name);

  constructor(
    private readonly reflector: Reflector,
    private readonly auditLogService: AuditLogService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    // Get audit log configuration from decorator
    const auditConfig = this.reflector.get<AuditLogConfig>(
      AUDIT_LOG_KEY,
      context.getHandler(),
    );

    // If no @AuditLog() decorator, skip
    if (!auditConfig) {
      return next.handle();
    }

    // Get request and user
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // Extract parameters
    const params = this.extractParameters(context);
    const entityId = auditConfig.entityIdParam
      ? params[auditConfig.entityIdParam]
      : null;

    // Prepare before data (method params)
    const beforeJson = auditConfig.includeParams ? params : undefined;

    return next.handle().pipe(
      // On success
      tap((result) => {
        const afterJson = auditConfig.includeResult ? result : undefined;

        this.auditLogService
          .create({
            actorUserId: user?.sub,
            action: auditConfig.action,
            entityType: auditConfig.entityType,
            entityId,
            beforeJson,
            afterJson,
            ...this.auditLogService.extractRequestMetadata(request),
            status: 'success',
          })
          .catch((error) => {
            this.logger.error('Failed to create audit log', error);
          });
      }),

      // On error
      catchError((error) => {
        this.auditLogService
          .create({
            actorUserId: user?.sub,
            action: auditConfig.action,
            entityType: auditConfig.entityType,
            entityId,
            beforeJson,
            ...this.auditLogService.extractRequestMetadata(request),
            status: 'failed',
            errorMessage: error.message || 'Unknown error',
          })
          .catch((err) => {
            this.logger.error('Failed to create audit log', err);
          });

        throw error; // Re-throw original error
      }),
    );
  }

  /**
   * Extract parameters from different argument types (path params, body, query)
   */
  private extractParameters(context: ExecutionContext): Record<string, any> {
    const request = context.switchToHttp().getRequest();
    return {
      ...request.params,
      ...request.body,
      ...request.query,
    };
  }
}
