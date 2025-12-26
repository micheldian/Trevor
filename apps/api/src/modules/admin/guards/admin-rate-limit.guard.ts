import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request } from 'express';
import { AdminIpLockService } from '../services/admin-ip-lock.service';

/**
 * Admin Rate Limit Guard
 *
 * Enforces rate limiting on admin endpoints by IP address.
 * - Checks request count per IP within time window
 * - Returns 429 Too Many Requests if limit exceeded
 * - Provides X-RateLimit-* headers in response
 *
 * Applied globally to all admin routes.
 */
@Injectable()
export class AdminRateLimitGuard implements CanActivate {
  private readonly logger = new Logger(AdminRateLimitGuard.name);

  constructor(private readonly ipLockService: AdminIpLockService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse();
    const ip = this.getClientIp(request);

    // Check rate limit
    const rateLimitExceeded = await this.ipLockService.checkRateLimit(ip);

    // Get remaining requests for headers
    const remaining = await this.ipLockService.getRemainingRequests(ip);

    // Add rate limit headers
    response.header('X-RateLimit-Remaining', remaining.toString());

    if (rateLimitExceeded) {
      this.logger.warn(`Rate limit exceeded for IP ${ip}`);

      throw new HttpException(
        {
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          message: 'Too many requests. Please try again later.',
          remainingRequests: remaining,
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
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
