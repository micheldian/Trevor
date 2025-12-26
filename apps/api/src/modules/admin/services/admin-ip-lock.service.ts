import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRedis } from '@liaoliaots/nestjs-redis';
import Redis from 'ioredis';

/**
 * Admin IP Lock Service
 *
 * Manages IP-based rate limiting and locking for admin endpoints.
 * Uses Redis to track:
 * - Request counts per IP (rate limiting)
 * - Failed attempts per IP
 * - Locked IP addresses
 */
@Injectable()
export class AdminIpLockService {
  private readonly logger = new Logger(AdminIpLockService.name);

  // Configuration (loaded from env)
  private readonly adminRateLimit: number;
  private readonly adminRateTtl: number;
  private readonly maxFailedAttempts: number;
  private readonly lockDuration: number;

  constructor(
    @InjectRedis() private readonly redis: Redis,
    private readonly configService: ConfigService,
  ) {
    // Load configuration from environment
    this.adminRateLimit = this.configService.get('ADMIN_RATE_LIMIT', 20); // 20 requests
    this.adminRateTtl = this.configService.get('ADMIN_RATE_TTL', 60); // per 60 seconds
    this.maxFailedAttempts = this.configService.get('ADMIN_MAX_FAILED_ATTEMPTS', 5);
    this.lockDuration = this.configService.get('ADMIN_LOCK_DURATION', 1800); // 30 minutes
  }

  /**
   * Check if IP is locked
   */
  async isIpLocked(ip: string): Promise<boolean> {
    const lockKey = this.getLockKey(ip);
    const locked = await this.redis.get(lockKey);
    return locked === '1';
  }

  /**
   * Lock an IP address
   */
  async lockIp(ip: string, reason: string): Promise<void> {
    const lockKey = this.getLockKey(ip);
    await this.redis.setex(lockKey, this.lockDuration, '1');

    this.logger.warn(
      `IP ${ip} locked for ${this.lockDuration}s. Reason: ${reason}`,
    );
  }

  /**
   * Unlock an IP address (admin manual unlock)
   */
  async unlockIp(ip: string): Promise<void> {
    const lockKey = this.getLockKey(ip);
    await this.redis.del(lockKey);
    await this.redis.del(this.getFailedAttemptsKey(ip));

    this.logger.log(`IP ${ip} manually unlocked`);
  }

  /**
   * Check rate limit for IP
   * Returns true if rate limit exceeded
   */
  async checkRateLimit(ip: string): Promise<boolean> {
    const rateLimitKey = this.getRateLimitKey(ip);
    const current = await this.redis.incr(rateLimitKey);

    // Set TTL on first request
    if (current === 1) {
      await this.redis.expire(rateLimitKey, this.adminRateTtl);
    }

    return current > this.adminRateLimit;
  }

  /**
   * Record failed attempt (e.g., 403 Forbidden, invalid action)
   * Returns true if IP should be locked
   */
  async recordFailedAttempt(ip: string): Promise<boolean> {
    const failedKey = this.getFailedAttemptsKey(ip);
    const count = await this.redis.incr(failedKey);

    // Set TTL on first failed attempt
    if (count === 1) {
      await this.redis.expire(failedKey, this.lockDuration);
    }

    // Lock if max attempts reached
    if (count >= this.maxFailedAttempts) {
      await this.lockIp(ip, `${count} failed attempts`);
      return true;
    }

    this.logger.warn(
      `Failed attempt from ${ip}: ${count}/${this.maxFailedAttempts}`,
    );

    return false;
  }

  /**
   * Reset failed attempts for IP (after successful action)
   */
  async resetFailedAttempts(ip: string): Promise<void> {
    const failedKey = this.getFailedAttemptsKey(ip);
    await this.redis.del(failedKey);
  }

  /**
   * Get remaining requests for IP (rate limit)
   */
  async getRemainingRequests(ip: string): Promise<number> {
    const rateLimitKey = this.getRateLimitKey(ip);
    const current = parseInt((await this.redis.get(rateLimitKey)) || '0', 10);
    return Math.max(0, this.adminRateLimit - current);
  }

  /**
   * Get time until IP unlock
   */
  async getTimeUntilUnlock(ip: string): Promise<number> {
    const lockKey = this.getLockKey(ip);
    const ttl = await this.redis.ttl(lockKey);
    return ttl > 0 ? ttl : 0;
  }

  /**
   * Get failed attempts count for IP
   */
  async getFailedAttemptsCount(ip: string): Promise<number> {
    const failedKey = this.getFailedAttemptsKey(ip);
    return parseInt((await this.redis.get(failedKey)) || '0', 10);
  }

  /**
   * Get all locked IPs (for admin dashboard)
   */
  async getLockedIps(): Promise<string[]> {
    const pattern = 'admin:ip:lock:*';
    const keys = await this.redis.keys(pattern);
    return keys.map((key) => key.replace('admin:ip:lock:', ''));
  }

  /**
   * Get IP statistics
   */
  async getIpStats(ip: string): Promise<{
    isLocked: boolean;
    failedAttempts: number;
    remainingRequests: number;
    timeUntilUnlock: number;
  }> {
    const [isLocked, failedAttempts, remainingRequests, timeUntilUnlock] =
      await Promise.all([
        this.isIpLocked(ip),
        this.getFailedAttemptsCount(ip),
        this.getRemainingRequests(ip),
        this.getTimeUntilUnlock(ip),
      ]);

    return {
      isLocked,
      failedAttempts,
      remainingRequests,
      timeUntilUnlock,
    };
  }

  // Private helper methods for Redis keys
  private getLockKey(ip: string): string {
    return `admin:ip:lock:${ip}`;
  }

  private getRateLimitKey(ip: string): string {
    return `admin:ip:ratelimit:${ip}`;
  }

  private getFailedAttemptsKey(ip: string): string {
    return `admin:ip:failed:${ip}`;
  }
}
