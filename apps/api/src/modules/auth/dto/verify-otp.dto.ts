import {
  IsPhoneNumber,
  IsOptional,
  IsEmail,
  IsString,
  Length,
  Matches,
  ValidateIf,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyOtpDto {
  @ApiProperty({
    description: 'Numéro de téléphone français',
    example: '+33612345678',
    required: false,
  })
  @IsOptional()
  @IsPhoneNumber('FR')
  @ValidateIf((o) => !o.email)
  phone?: string;

  @ApiProperty({
    description: 'Email de l\'utilisateur',
    example: 'jean.dupont@email.fr',
    required: false,
  })
  @IsOptional()
  @IsEmail()
  @ValidateIf((o) => !o.phone)
  email?: string;

  @ApiProperty({
    description: 'Code OTP à 6 chiffres',
    example: '123456',
  })
  @IsString()
  @Length(6, 6, { message: 'Le code doit contenir exactement 6 chiffres' })
  @Matches(/^\d{6}$/, { message: 'Le code doit être composé de 6 chiffres' })
  code: string;
}
