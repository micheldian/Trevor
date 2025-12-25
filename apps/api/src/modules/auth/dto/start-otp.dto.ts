import { IsPhoneNumber, IsOptional, IsEmail, ValidateIf } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class StartOtpDto {
  @ApiProperty({
    description: 'Numéro de téléphone français',
    example: '+33612345678',
    required: false,
  })
  @IsOptional()
  @IsPhoneNumber('FR', {
    message: 'Numéro de téléphone invalide (format: +33XXXXXXXXX)',
  })
  @ValidateIf((o) => !o.email)
  phone?: string;

  @ApiProperty({
    description: 'Email de l\'utilisateur (alternative au téléphone)',
    example: 'jean.dupont@email.fr',
    required: false,
  })
  @IsOptional()
  @IsEmail({}, { message: 'Email invalide' })
  @ValidateIf((o) => !o.phone)
  email?: string;
}
