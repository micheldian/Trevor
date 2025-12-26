import { Injectable, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { UserStatus } from '../../../common/enums/user-status.enum';
import { JwtPayload } from '../interfaces/jwt-payload.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: JwtPayload): Promise<User> {
    const { sub } = payload;

    const user = await this.userRepository.findOne({
      where: { id: sub, isActive: true },
      relations: ['profiles'],
    });

    if (!user) {
      throw new UnauthorizedException('Utilisateur non trouvé ou inactif');
    }

    // Check if user is banned
    if (user.status === UserStatus.BANNED) {
      throw new ForbiddenException({
        message: 'Votre compte a été banni de manière permanente',
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
          ? ` jusqu'au ${user.suspendUntil.toISOString()}`
          : ' indéfiniment';

        throw new ForbiddenException({
          message: `Votre compte a été suspendu${until}`,
          reason: user.suspendReason,
          suspendedAt: user.suspendedAt,
          suspendUntil: user.suspendUntil,
          statusCode: 403,
          errorCode: 'ACCOUNT_SUSPENDED',
        });
      }

      // If suspension has expired, auto-restore to active
      user.status = UserStatus.ACTIVE;
      user.suspendReason = undefined;
      user.suspendUntil = undefined;
      user.suspendedAt = undefined;
      user.suspendedById = undefined;
    }

    // Update last login and last seen
    user.lastLoginAt = new Date();
    user.lastSeenAt = new Date();
    await this.userRepository.save(user);

    return user;
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
