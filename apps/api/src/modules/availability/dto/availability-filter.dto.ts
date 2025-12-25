import { IsOptional, IsEnum, IsUUID, IsNumber, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import {
  AvailabilityStatus,
  DateType,
  TimeSlot,
} from '../entities/availability.entity';

export class AvailabilityFilterDto {
  @ApiProperty({
    description: 'Filtrer par profil ID',
    required: false,
  })
  @IsOptional()
  @IsUUID('4')
  profileId?: string;

  @ApiProperty({
    enum: AvailabilityStatus,
    required: false,
  })
  @IsOptional()
  @IsEnum(AvailabilityStatus)
  status?: AvailabilityStatus;

  @ApiProperty({
    enum: DateType,
    required: false,
  })
  @IsOptional()
  @IsEnum(DateType)
  dateType?: DateType;

  @ApiProperty({
    enum: TimeSlot,
    required: false,
  })
  @IsOptional()
  @IsEnum(TimeSlot)
  timeSlot?: TimeSlot;

  @ApiProperty({
    description: 'Filtrer par latitude (pour recherche géo)',
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  latitude?: number;

  @ApiProperty({
    description: 'Filtrer par longitude (pour recherche géo)',
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  longitude?: number;

  @ApiProperty({
    description: 'Distance maximale en km (si latitude/longitude fournis)',
    required: false,
    default: 50,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(200)
  maxDistance?: number;

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
