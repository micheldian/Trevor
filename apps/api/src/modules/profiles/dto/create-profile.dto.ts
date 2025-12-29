import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsString,
  IsOptional,
  IsArray,
  IsNumber,
  Min,
  Max,
  MaxLength,
  IsBoolean,
} from 'class-validator';
import { ProfileType } from '../entities/profile.entity';

export class CreateProfileDto {
  @ApiProperty({
    description: 'Type de profil',
    enum: ProfileType,
    example: ProfileType.EMPLOYER,
  })
  @IsEnum(ProfileType)
  type: ProfileType;

  @ApiProperty({
    description: 'Ville',
    example: 'Strasbourg',
  })
  @IsString()
  @MaxLength(100)
  city: string;

  @ApiProperty({
    description: 'Code postal',
    example: '67000',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(5)
  postalCode?: string;

  @ApiProperty({
    description: 'Biographie',
    required: false,
  })
  @IsString()
  @IsOptional()
  bio?: string;

  @ApiProperty({
    description: 'Nom de l\'entreprise (pour les employeurs)',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  companyName?: string;

  @ApiProperty({
    description: 'Numéro SIRET (pour les employeurs)',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(14)
  siret?: string;

  @ApiProperty({
    description: 'Adresse complète',
    required: false,
  })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiProperty({
    description: 'Compétences',
    required: false,
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  skills?: string[];

  @ApiProperty({
    description: 'Années d\'expérience',
    required: false,
    minimum: 0,
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  experienceYears?: number;

  @ApiProperty({
    description: 'Certifications',
    required: false,
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  certifications?: string[];

  @ApiProperty({
    description: 'Numéro WhatsApp',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(20)
  whatsappNumber?: string;

  @ApiProperty({
    description: 'Moyen de contact préféré',
    required: false,
    default: 'whatsapp',
  })
  @IsString()
  @IsOptional()
  @MaxLength(20)
  preferredContact?: string;

  @ApiProperty({
    description: 'Possède un véhicule',
    required: false,
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  hasVehicle?: boolean;

  @ApiProperty({
    description: 'Latitude',
    required: false,
  })
  @IsNumber()
  @IsOptional()
  @Min(-90)
  @Max(90)
  latitude?: number;

  @ApiProperty({
    description: 'Longitude',
    required: false,
  })
  @IsNumber()
  @IsOptional()
  @Min(-180)
  @Max(180)
  longitude?: number;
}
