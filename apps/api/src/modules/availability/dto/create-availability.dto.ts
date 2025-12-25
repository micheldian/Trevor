import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsLatitude,
  IsLongitude,
  Min,
  Max,
  MaxLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import {
  AvailabilityStatus,
  DateType,
  TimeSlot,
} from '../entities/availability.entity';

export class CreateAvailabilityDto {
  @ApiProperty({
    enum: AvailabilityStatus,
    example: AvailabilityStatus.ON,
    description: 'Statut de disponibilité',
    default: AvailabilityStatus.ON,
  })
  @IsEnum(AvailabilityStatus, {
    message: 'Status doit être "on" ou "off"',
  })
  status: AvailabilityStatus = AvailabilityStatus.ON;

  @ApiProperty({
    enum: DateType,
    example: DateType.TODAY,
    description: 'Date de disponibilité',
  })
  @IsEnum(DateType, {
    message: 'Date type doit être "today" ou "tomorrow"',
  })
  dateType: DateType;

  @ApiProperty({
    enum: TimeSlot,
    example: TimeSlot.MORNING,
    description: 'Créneau horaire',
  })
  @IsEnum(TimeSlot, {
    message: 'Time slot doit être "morning", "afternoon" ou "day"',
  })
  timeSlot: TimeSlot;

  @ApiProperty({
    example: 48.5734,
    description: 'Latitude (position géographique)',
    minimum: -90,
    maximum: 90,
  })
  @IsNumber()
  @IsLatitude({ message: 'Latitude invalide (-90 à 90)' })
  latitude: number;

  @ApiProperty({
    example: 7.7521,
    description: 'Longitude (position géographique)',
    minimum: -180,
    maximum: 180,
  })
  @IsNumber()
  @IsLongitude({ message: 'Longitude invalide (-180 à 180)' })
  longitude: number;

  @ApiProperty({
    example: 30,
    description: 'Rayon de recherche en kilomètres',
    minimum: 1,
    maximum: 200,
    default: 50,
  })
  @IsNumber()
  @Min(1, { message: 'Rayon minimum: 1 km' })
  @Max(200, { message: 'Rayon maximum: 200 km' })
  radiusKm: number = 50;

  @ApiProperty({
    example: 'Disponible pour vendanges uniquement',
    required: false,
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'Notes trop longues (max 500 caractères)' })
  notes?: string;
}
