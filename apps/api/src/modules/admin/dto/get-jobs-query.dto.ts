import { IsOptional, IsEnum, IsString, IsInt, Min, IsISO8601, IsNumber, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { JobStatus } from '../../jobs/entities/job.entity';

export class GetJobsQueryDto {
  @ApiPropertyOptional({
    description: 'Filter by job status',
    enum: JobStatus,
  })
  @IsOptional()
  @IsEnum(JobStatus)
  status?: JobStatus;

  @ApiPropertyOptional({
    description: 'Filter by employer profile ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsUUID()
  employerId?: string;

  @ApiPropertyOptional({
    description: 'Filter by culture/tag (exact match or partial)',
    example: 'pomme',
  })
  @IsOptional()
  @IsString()
  culture?: string;

  @ApiPropertyOptional({
    description: 'Filter by tag (searches in tags array)',
    example: 'cueillette',
  })
  @IsOptional()
  @IsString()
  tag?: string;

  @ApiPropertyOptional({
    description: 'Filter jobs created after this date (ISO 8601)',
    example: '2024-01-01T00:00:00Z',
  })
  @IsOptional()
  @IsISO8601()
  createdAfter?: string;

  @ApiPropertyOptional({
    description: 'Filter jobs created before this date (ISO 8601)',
    example: '2024-12-31T23:59:59Z',
  })
  @IsOptional()
  @IsISO8601()
  createdBefore?: string;

  @ApiPropertyOptional({
    description: 'Filter jobs with specific_date after this date (ISO 8601)',
    example: '2024-06-01',
  })
  @IsOptional()
  @IsISO8601()
  jobDateAfter?: string;

  @ApiPropertyOptional({
    description: 'Filter jobs with specific_date before this date (ISO 8601)',
    example: '2024-06-30',
  })
  @IsOptional()
  @IsISO8601()
  jobDateBefore?: string;

  @ApiPropertyOptional({
    description: 'Filter jobs within distance (km) from coordinates',
    example: 50,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxDistanceKm?: number;

  @ApiPropertyOptional({
    description: 'Latitude for distance filtering (requires maxDistanceKm)',
    example: 48.8566,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  latitude?: number;

  @ApiPropertyOptional({
    description: 'Longitude for distance filtering (requires maxDistanceKm)',
    example: 2.3522,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  longitude?: number;

  @ApiPropertyOptional({
    description: 'Search query (title, description, culture)',
    example: 'récolte',
  })
  @IsOptional()
  @IsString()
  q?: string;

  @ApiPropertyOptional({
    description: 'Number of results per page',
    default: 20,
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 20;

  @ApiPropertyOptional({
    description: 'Offset for pagination',
    default: 0,
    minimum: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  offset?: number = 0;

  @ApiPropertyOptional({
    description: 'Sort field',
    enum: ['createdAt', 'updatedAt', 'publishedAt', 'specificDate'],
    default: 'createdAt',
  })
  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';

  @ApiPropertyOptional({
    description: 'Sort order',
    enum: ['ASC', 'DESC'],
    default: 'DESC',
  })
  @IsOptional()
  @IsEnum(['ASC', 'DESC'])
  sortOrder?: 'ASC' | 'DESC' = 'DESC';
}
