import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Redis } from 'ioredis';
import { InjectRedis } from '@liaoliaots/nestjs-redis';
import { OtpData } from '../interfaces/jwt-payload.interface';
import { User } from '../../users/entities/user.entity';

@Injectable()
export class OtpService {
  private readonly logger = new Logger(OtpService.name);
  private readonly OTP_EXPIRATION_MS = 10 * 60 * 1000; // 10 minutes
  private readonly MAX_ATTEMPTS = 3;
  private readonly OTP_PREFIX = 'otp:';

  constructor(
    private readonly configService: ConfigService,
    @InjectRedis() private readonly redis: Redis,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  /**
   * Génère un code OTP à 6 chiffres
   */
  generateOtpCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * Stocke le code OTP dans Redis
   * @param identifier - Phone ou email
   * @param code - Code OTP généré
   */
  async storeOtp(identifier: string, code: string): Promise<void> {
    const key = this.getRedisKey(identifier);
    const now = Date.now();

    const otpData: OtpData = {
      code,
      phone: identifier.startsWith('+') ? identifier : undefined,
      email: identifier.includes('@') ? identifier : undefined,
      expiresAt: now + this.OTP_EXPIRATION_MS,
      attempts: 0,
      createdAt: now,
    };

    // Stockage Redis avec TTL automatique
    await this.redis.setex(
      key,
      Math.floor(this.OTP_EXPIRATION_MS / 1000),
      JSON.stringify(otpData),
    );

    this.logger.log(`OTP stored for ${identifier} (expires in 10min)`);
  }

  /**
   * Vérifie le code OTP
   * @param identifier - Phone ou email
   * @param code - Code saisi par l'utilisateur
   * @returns true si valide
   */
  async verifyOtp(identifier: string, code: string): Promise<boolean> {
    const key = this.getRedisKey(identifier);
    const data = await this.redis.get(key);

    if (!data) {
      throw new UnauthorizedException('Code expiré ou inexistant');
    }

    const otpData: OtpData = JSON.parse(data);
    const now = Date.now();

    // Vérifier expiration
    if (now > otpData.expiresAt) {
      await this.redis.del(key);
      throw new UnauthorizedException('Code expiré');
    }

    // Vérifier nombre de tentatives
    if (otpData.attempts >= this.MAX_ATTEMPTS) {
      await this.redis.del(key);
      throw new UnauthorizedException(
        'Trop de tentatives. Demandez un nouveau code.',
      );
    }

    // Incrémenter tentatives
    otpData.attempts += 1;
    await this.redis.setex(
      key,
      Math.floor((otpData.expiresAt - now) / 1000),
      JSON.stringify(otpData),
    );

    // Vérifier code
    if (otpData.code !== code) {
      this.logger.warn(
        `Invalid OTP attempt for ${identifier} (${otpData.attempts}/${this.MAX_ATTEMPTS})`,
      );
      throw new UnauthorizedException(
        `Code incorrect (${otpData.attempts}/${this.MAX_ATTEMPTS} tentatives)`,
      );
    }

    // Code valide → Supprimer de Redis
    await this.redis.del(key);
    this.logger.log(`OTP verified successfully for ${identifier}`);

    return true;
  }

  /**
   * Trouve ou crée un utilisateur à partir de l'identifiant
   */
  async findOrCreateUser(identifier: string): Promise<User> {
    const isPhone = identifier.startsWith('+');
    const whereClause = isPhone ? { phone: identifier } : { email: identifier };

    let user = await this.userRepository.findOne({
      where: whereClause,
      relations: ['profiles'],
    });

    if (!user) {
      // Créer un nouvel utilisateur
      user = this.userRepository.create({
        phone: isPhone ? identifier : undefined,
        email: !isPhone ? identifier : undefined,
        phoneVerified: isPhone,
        // firstName et lastName seront ajoutés plus tard
      });

      user = await this.userRepository.save(user);
      this.logger.log(`New user created: ${user.id} (${identifier})`);
    } else {
      // Marquer comme vérifié
      if (isPhone) {
        user.phoneVerified = true;
      }
      await this.userRepository.save(user);
    }

    return user;
  }

  /**
   * Vérifie le rate limiting (max 5 OTP par heure par identifiant)
   */
  async checkRateLimit(identifier: string): Promise<void> {
    const rateLimitKey = `${this.OTP_PREFIX}rate:${identifier}`;
    const count = await this.redis.incr(rateLimitKey);

    if (count === 1) {
      // Première requête dans la fenêtre → Set TTL 1h
      await this.redis.expire(rateLimitKey, 3600);
    }

    if (count > 5) {
      throw new BadRequestException(
        'Trop de demandes. Réessayez dans 1 heure.',
      );
    }
  }

  /**
   * Masque l'identifiant pour la réponse (privacy)
   */
  maskIdentifier(identifier: string): string {
    if (identifier.startsWith('+')) {
      // Phone: +33612345678 → +336****5678
      return identifier.slice(0, 5) + '****' + identifier.slice(-4);
    } else {
      // Email: jean.dupont@email.fr → j***@email.fr
      const [local, domain] = identifier.split('@');
      return local[0] + '***@' + domain;
    }
  }

  private getRedisKey(identifier: string): string {
    return `${this.OTP_PREFIX}${identifier}`;
  }
}
