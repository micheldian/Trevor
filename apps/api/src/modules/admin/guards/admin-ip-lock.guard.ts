import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { AdminIpLockService } from '../services/admin-ip-lock.service';
import { SENSITIVE_ACTION_KEY } from '../decorators/sensitive-action.decorator';

/**
 * Admin IP Lock Guard
 *
 * Prevents access from locked IP addresses.
 * - Checks if IP is locked due to repeated failures
 * - Records failed attempts on sensitive actions
 * - Auto-locks IP after max failed attempts
 * - Returns 403 Forbidden with unlock time
 *
 * Applied globally to all admin routes.
 * Works in conjunction with @SensitiveAction() decorator.
 */
@Injectable()
export class AdminIpLockGuard implements CanActivate {
  private readonly logger = new Logger(AdminIpLockGuard.name);

  constructor(
    private readonly ipLockService: AdminIpLockService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const ip = this.getClientIp(request);

    // Check if IP is locked
    const isLocked = await this.ipLockService.isIpLocked(ip);

    if (isLocked) {
      const timeUntilUnlock =
        await this.ipLockService.getTimeUntilUnlock(ip);
      const minutesRemaining = Math.ceil(timeUntilUnlock / 60);

      this.logger.warn(
        `Blocked request from locked IP ${ip} (${minutesRemaining} minutes remaining)`,
      );

      throw new HttpException(
        {
          statusCode: HttpStatus.FORBIDDEN,
          message: `Your IP address has been temporarily locked due to suspicious activity. Please try again in ${minutesRemaining} minutes.`,
          timeUntilUnlock,
          minutesRemaining,
        },
        HttpStatus.FORBIDDEN,
      );
    }

    // Check if this is a sensitive action
    const isSensitiveAction = this.reflector.getAllAndOverride<boolean>(
      SENSITIVE_ACTION_KEY,
      [context.getHandler(), context.getClass()],
    );

    // If sensitive action, we'll track it for potential locking
    // (actual failed attempt recording happens in exception filters or after response)
    if (isSensitiveAction) {
      // Store flag in request for later use
      (request as any).isSensitiveAction = true;
    }

    return true;
  }

  /**
   * Extract client IP from request
   * Handles proxies and load balancers
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
