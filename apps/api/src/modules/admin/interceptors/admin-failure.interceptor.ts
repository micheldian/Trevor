import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { AdminIpLockService } from '../services/admin-ip-lock.service';
import { SENSITIVE_ACTION_KEY } from '../decorators/sensitive-action.decorator';

/**
 * Admin Failure Interceptor
 *
 * Records failed attempts on sensitive admin actions.
 * - Catches 403 Forbidden errors
 * - Records failed attempt for IP
 * - Auto-locks IP after max attempts reached
 *
 * Works in conjunction with @SensitiveAction() decorator.
 */
@Injectable()
export class AdminFailureInterceptor implements NestInterceptor {
  private readonly logger = new Logger(AdminFailureInterceptor.name);

  constructor(
    private readonly ipLockService: AdminIpLockService,
    private readonly reflector: Reflector,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();

    // Check if this is a sensitive action
    const isSensitiveAction = this.reflector.getAllAndOverride<boolean>(
      SENSITIVE_ACTION_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!isSensitiveAction) {
      // Not a sensitive action, don't track failures
      return next.handle();
    }

    const ip = this.getClientIp(request);

    return next.handle().pipe(
      catchError((error) => {
        // Record failed attempt for 403 Forbidden errors
        if (error.status === 403) {
          this.recordFailedAttempt(ip, request);
        }

        // Re-throw the error
        return throwError(() => error);
      }),
    );
  }

  /**
   * Record failed attempt asynchronously
   * Don't block the response
   */
  private async recordFailedAttempt(ip: string, request: Request) {
    try {
      const shouldLock =
        await this.ipLockService.recordFailedAttempt(ip);

      if (shouldLock) {
        this.logger.warn(
          `IP ${ip} locked after repeated failed attempts on ${request.method} ${request.url}`,
        );
      }
    } catch (error) {
      // Never break the flow due to tracking errors
      this.logger.error(
        `Failed to record failed attempt for IP ${ip}:`,
        error,
      );
    }
  }

  /**
   * Extract client IP from request
   */
  private getClientIp(request: Request): string {
    const forwarded = request.headers['x-forwarded-for'];
    if (forwarded) {
      const ips = (forwarded as string).split(',');
      return ips[0].trim();
    }
    return request.ip || request.socket.remoteAddress || 'unknown';
  }
}
