import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { OtpService } from './services/otp.service';
import { SmsService } from './services/sms.service';
import { StartOtpDto } from './dto/start-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { AuthResponse, JwtPayload } from './interfaces/jwt-payload.interface';
import { User } from '../users/entities/user.entity';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly otpService: OtpService,
    private readonly smsService: SmsService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Démarre le processus OTP (génère et envoie le code)
   */
  async startOtp(dto: StartOtpDto): Promise<{
    success: boolean;
    message: string;
    expiresIn: number;
    maskedContact: string;
  }> {
    const identifier = dto.phone || dto.email;

    if (!identifier) {
      throw new Error('Phone ou email requis');
    }

    // Rate limiting
    await this.otpService.checkRateLimit(identifier);

    // Générer code
    const code = this.otpService.generateOtpCode();

    // Stocker dans Redis
    await this.otpService.storeOtp(identifier, code);

    // Envoyer SMS (ou email si implémenté)
    if (dto.phone) {
      await this.smsService.sendOtp(dto.phone, code);
    } else {
      // TODO: Implémenter EmailService
      this.logger.log(`[EMAIL MOCK] Code OTP pour ${dto.email}: ${code}`);
    }

    return {
      success: true,
      message: `Code OTP envoyé à ${this.otpService.maskIdentifier(identifier)}`,
      expiresIn: 600, // 10 minutes
      maskedContact: this.otpService.maskIdentifier(identifier),
    };
  }

  /**
   * Vérifie le code OTP et retourne JWT token
   */
  async verifyOtp(dto: VerifyOtpDto): Promise<AuthResponse> {
    const identifier = dto.phone || dto.email;

    if (!identifier) {
      throw new Error('Phone ou email requis');
    }

    // Vérifier code OTP
    await this.otpService.verifyOtp(identifier, dto.code);

    // Trouver ou créer utilisateur
    const user = await this.otpService.findOrCreateUser(identifier);

    // Générer JWT tokens
    const tokens = await this.generateTokens(user);

    return {
      ...tokens,
      user: {
        id: user.id,
        email: user.email,
        phone: user.phone,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        profiles: user.profiles?.map((p) => ({
          id: p.id,
          type: p.type,
          isComplete: p.isComplete,
        })),
      },
    };
  }

  /**
   * Génère les JWT access et refresh tokens
   */
  async generateTokens(user: User): Promise<{
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  }> {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      phone: user.phone,
      role: user.role,
      profiles: user.profiles?.map((p) => ({
        id: p.id,
        type: p.type as 'worker' | 'team_lead' | 'employer',
      })),
    };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: this.configService.get('JWT_EXPIRATION', '7d'),
    });

    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: this.configService.get('JWT_REFRESH_EXPIRATION', '30d'),
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: 7 * 24 * 60 * 60, // 7 jours en secondes
    };
  }

  /**
   * Rafraîchit le JWT token
   */
  async refreshToken(refreshToken: string): Promise<{
    accessToken: string;
    expiresIn: number;
  }> {
    try {
      const payload = this.jwtService.verify(refreshToken);
      const user = await this.otpService.findOrCreateUser(
        payload.phone || payload.email,
      );

      const tokens = await this.generateTokens(user);

      return {
        accessToken: tokens.accessToken,
        expiresIn: tokens.expiresIn,
      };
    } catch (error) {
      throw new Error('Refresh token invalide ou expiré');
    }
  }
}
