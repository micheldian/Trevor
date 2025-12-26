import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Get,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { StartOtpDto } from './dto/start-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { User } from '../users/entities/user.entity';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('start')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 5, ttl: 3600000 } }) // 5 requêtes par heure
  @ApiOperation({
    summary: 'Demander un code OTP',
    description: 'Génère et envoie un code OTP par SMS ou email',
  })
  @ApiResponse({
    status: 200,
    description: 'Code OTP envoyé avec succès',
    schema: {
      example: {
        success: true,
        message: 'Code OTP envoyé à +336****5678',
        expiresIn: 600,
        maskedContact: '+336****5678',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Validation échouée ou rate limit dépassé',
  })
  @ApiResponse({
    status: 429,
    description: 'Trop de requêtes (max 5 par heure)',
  })
  async startOtp(@Body() dto: StartOtpDto) {
    return this.authService.startOtp(dto);
  }

  @Public()
  @Post('verify')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 3, ttl: 600000 } }) // 3 tentatives par 10 minutes
  @ApiOperation({
    summary: 'Vérifier le code OTP',
    description: 'Vérifie le code OTP et retourne un JWT token',
  })
  @ApiResponse({
    status: 200,
    description: 'OTP vérifié, JWT token retourné',
    schema: {
      example: {
        accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        expiresIn: 604800,
        user: {
          id: 'uuid',
          phone: '+33612345678',
          email: null,
          firstName: null,
          lastName: null,
          profiles: [],
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Code invalide, expiré ou trop de tentatives',
  })
  async verifyOtp(@Body() dto: VerifyOtpDto) {
    return this.authService.verifyOtp(dto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Récupérer le profil utilisateur courant',
    description: 'Retourne les informations de l\'utilisateur authentifié',
  })
  @ApiResponse({
    status: 200,
    description: 'Profil utilisateur',
  })
  @ApiResponse({
    status: 401,
    description: 'Non authentifié',
  })
  async getMe(@CurrentUser() user: User) {
    return {
      id: user.id,
      email: user.email,
      phone: user.phone,
      firstName: user.firstName,
      lastName: user.lastName,
      avatarUrl: user.avatarUrl,
      isVerified: user.isVerified,
      isPhoneVerified: user.isPhoneVerified,
      profiles: user.profiles?.map((p) => ({
        id: p.id,
        type: p.type,
        isComplete: p.isComplete,
      })),
    };
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Déconnexion',
    description: 'Révoque le refresh token (si implémenté)',
  })
  @ApiResponse({
    status: 204,
    description: 'Déconnecté avec succès',
  })
  async logout(@CurrentUser() user: User) {
    // TODO: Blacklist refresh token dans Redis
    // await this.redis.set(`blacklist:${refreshToken}`, '1', 'EX', 30 * 24 * 60 * 60);
    return;
  }
}
