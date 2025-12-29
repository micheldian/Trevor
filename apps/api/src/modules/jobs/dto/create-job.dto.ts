import {
  IsString,
  IsEnum,
  IsInt,
  IsLatitude,
  IsLongitude,
  IsOptional,
  IsArray,
  IsBoolean,
  IsDateString,
  Min,
  Max,
  MinLength,
  MaxLength,
  IsNumber,
  ValidateIf,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  JobDateType,
  JobTimeSlot,
  JobType,
} from '../entities/job.entity';

export class CreateJobDto {
  @ApiProperty({ description: 'Titre de la mission', example: 'Vendanges Riesling 2024' })
  @IsString()
  @MinLength(5)
  @MaxLength(200)
  title: string;

  @ApiProperty({
    description: 'Type de contrat',
    enum: JobType,
    example: JobType.SEASONAL,
  })
  @IsEnum(JobType)
  jobType: JobType;

  @ApiPropertyOptional({
    description: 'Description détaillée de la mission',
    example: 'Recherche 5 personnes pour vendanges de Riesling...',
  })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @ApiProperty({ description: 'Type de culture', example: 'Riesling' })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  culture: string;

  @ApiPropertyOptional({
    description: 'Tags pour la mission',
    example: ['vendanges', 'urgent', 'expérience requise'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({
    description: 'Compétences requises',
    example: ['viticulture', 'vendanges'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  requiredSkills?: string[];

  @ApiProperty({
    description: 'Type de date',
    enum: JobDateType,
    example: JobDateType.THIS_WEEK,
  })
  @IsEnum(JobDateType)
  dateType: JobDateType;

  @ApiPropertyOptional({
    description: 'Date spécifique (requis si dateType = specific_date)',
    example: '2024-09-15',
  })
  @ValidateIf((o) => o.dateType === JobDateType.SPECIFIC_DATE)
  @IsDateString()
  specificDate?: string;

  @ApiProperty({
    description: 'Créneau horaire',
    enum: JobTimeSlot,
    example: JobTimeSlot.DAY,
  })
  @IsEnum(JobTimeSlot)
  timeSlot: JobTimeSlot;

  @ApiProperty({ description: 'Nombre de personnes recherchées', example: 5 })
  @IsInt()
  @Min(1)
  @Max(100)
  nbPeople: number;

  @ApiProperty({ description: 'Latitude du lieu de mission', example: 48.5734 })
  @IsLatitude()
  latitude: number;

  @ApiProperty({ description: 'Longitude du lieu de mission', example: 7.7521 })
  @IsLongitude()
  longitude: number;

  @ApiPropertyOptional({
    description: 'Adresse complète',
    example: '15 Route des Vins, 67140 Barr',
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  address?: string;

  @ApiPropertyOptional({ description: 'Ville', example: 'Barr' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  city?: string;

  @ApiPropertyOptional({ description: 'Code postal', example: '67140' })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  postalCode?: string;

  @ApiPropertyOptional({ description: 'Taux horaire en euros', example: 12.5 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(1000)
  hourlyRate?: number;

  @ApiPropertyOptional({ description: 'Nombre d\'heures estimées', example: 8 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(200)
  estimatedHours?: number;

  @ApiPropertyOptional({ description: 'Mission urgente', example: true })
  @IsOptional()
  @IsBoolean()
  isUrgent?: boolean;
}
