import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../modules/users/entities/user.entity';
import { UserStatus } from '../enums/user-status.enum';

/**
 * User Status Guard
 *
 * Checks if the authenticated user's account is active (not suspended or banned)
 * Blocks access if user is suspended or banned
 *
 * Usage:
 * - Apply to routes/controllers where suspended/banned users should be blocked
 * - Requires JwtAuthGuard to be applied first (to get user from request)
 *
 * @example
 * @UseGuards(JwtAuthGuard, UserStatusGuard)
 * @Post('jobs')
 * createJob() { ... }
 */
@Injectable()
export class UserStatusGuard implements CanActivate {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const userId = request.user?.userId;

    if (!userId) {
      throw new UnauthorizedException('User not authenticated');
    }

    // Fetch fresh user status from database
    const user = await this.userRepository.findOne({
      where: { id: userId },
      select: [
        'id',
        'status',
        'suspendReason',
        'suspendUntil',
        'suspendedAt',
        'bannedAt',
      ],
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Check if user is banned
    if (user.status === UserStatus.BANNED) {
      throw new ForbiddenException({
        message: 'Your account has been permanently banned',
        reason: user.suspendReason,
        bannedAt: user.bannedAt,
        statusCode: 403,
        errorCode: 'ACCOUNT_BANNED',
      });
    }

    // Check if user is suspended
    if (user.status === UserStatus.SUSPENDED) {
      const isSuspended = this.isUserSuspended(user);

      if (isSuspended) {
        const until = user.suspendUntil
          ? ` until ${user.suspendUntil.toISOString()}`
          : ' indefinitely';

        throw new ForbiddenException({
          message: `Your account has been suspended${until}`,
          reason: user.suspendReason,
          suspendedAt: user.suspendedAt,
          suspendUntil: user.suspendUntil,
          statusCode: 403,
          errorCode: 'ACCOUNT_SUSPENDED',
        });
      }

      // If suspension has expired, allow access (admin should update status)
      // In production, consider auto-updating status here or via cron job
    }

    return true;
  }

  /**
   * Check if user is currently suspended (considering expiry)
   */
  private isUserSuspended(user: User): boolean {
    if (user.status !== UserStatus.SUSPENDED) {
      return false;
    }

    // If no expiry date, suspension is indefinite
    if (!user.suspendUntil) {
      return true;
    }

    // Check if suspension has expired
    return new Date() < user.suspendUntil;
  }
}
