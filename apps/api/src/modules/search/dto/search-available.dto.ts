import {
  IsOptional,
  IsString,
  IsEnum,
  IsBoolean,
  IsNumber,
  IsUUID,
  Min,
  Max,
  MinLength,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { DateType, TimeSlot } from '../../availability/entities/availability.entity';

export class SearchAvailableDto {
  @ApiProperty({
    description: 'Recherche textuelle (compétences, ville, nom)',
    example: 'pomme vendanges',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'Recherche trop courte (min 2 caractères)' })
  q?: string;

  @ApiProperty({
    enum: DateType,
    description: 'Date de disponibilité',
    example: DateType.TODAY,
    required: false,
  })
  @IsOptional()
  @IsEnum(DateType)
  dateType?: DateType;

  @ApiProperty({
    enum: TimeSlot,
    description: 'Créneau horaire',
    example: TimeSlot.MORNING,
    required: false,
  })
  @IsOptional()
  @IsEnum(TimeSlot)
  timeSlot?: TimeSlot;

  @ApiProperty({
    description: 'Filtrer uniquement les équipes',
    default: false,
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  onlyTeams?: boolean = false;

  @ApiProperty({
    description: 'Filtrer uniquement ceux avec véhicule',
    default: false,
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  hasVehicle?: boolean = false;

  @ApiProperty({
    description: 'Rating minimum (0-5)',
    example: 4.0,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(5)
  minRating?: number;

  @ApiProperty({
    description: 'Distance maximale en km (depuis position employer)',
    example: 50,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(200)
  maxDistanceKm?: number;

  @ApiProperty({
    description: 'ID de l\'employer (pour calculer distance)',
    example: 'uuid',
    required: false,
  })
  @IsOptional()
  @IsUUID('4')
  employerId?: string;

  @ApiProperty({
    description: 'Compétences recherchées (séparées par virgule)',
    example: 'viticulture,vendanges',
    required: false,
  })
  @IsOptional()
  @IsString()
  skills?: string;

  @ApiProperty({ default: 20, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @ApiProperty({ default: 0, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  offset?: number = 0;
}
