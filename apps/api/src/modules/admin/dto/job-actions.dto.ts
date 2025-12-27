import { IsString, IsNotEmpty, IsEnum, IsOptional, IsBoolean, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { JobStatus } from '../../jobs/entities/job.entity';

/**
 * DTO for cancelling a job
 */
export class CancelJobDto {
  @ApiProperty({
    description: 'Reason for cancelling the job',
    example: 'Job no longer needed',
    minLength: 10,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(10, { message: 'Cancellation reason must be at least 10 characters' })
  reason: string;

  @ApiPropertyOptional({
    description: 'Additional admin notes',
    example: 'Cancelled due to duplicate posting',
  })
  @IsOptional()
  @IsString()
  adminNotes?: string;
}

/**
 * DTO for completing a job
 */
export class CompleteJobDto {
  @ApiPropertyOptional({
    description: 'Override validation requiring CONFIRMED status',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  override?: boolean;

  @ApiPropertyOptional({
    description: 'Completion notes',
    example: 'Job completed successfully',
  })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({
    description: 'Admin notes for override',
    example: 'Force completed due to employer confirmation',
  })
  @IsOptional()
  @IsString()
  adminNotes?: string;
}

/**
 * DTO for reopening a job
 */
export class ReopenJobDto {
  @ApiProperty({
    description: 'Target status after reopening',
    enum: JobStatus,
    example: JobStatus.PUBLISHED,
  })
  @IsEnum(JobStatus)
  targetStatus: JobStatus;

  @ApiPropertyOptional({
    description: 'Reason for reopening',
    example: 'Previous cancellation was a mistake',
  })
  @IsOptional()
  @IsString()
  reason?: string;

  @ApiPropertyOptional({
    description: 'Admin notes',
    example: 'Reopened at employer request',
  })
  @IsOptional()
  @IsString()
  adminNotes?: string;
}

/**
 * DTO for changing job status
 */
export class ChangeJobStatusDto {
  @ApiProperty({
    description: 'New job status',
    enum: JobStatus,
    example: JobStatus.PUBLISHED,
  })
  @IsEnum(JobStatus)
  status: JobStatus;

  @ApiPropertyOptional({
    description: 'Reason for status change',
    example: 'Moving to confirmed after employer verification',
  })
  @IsOptional()
  @IsString()
  reason?: string;

  @ApiPropertyOptional({
    description: 'Override validation rules (use with caution)',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  override?: boolean;

  @ApiPropertyOptional({
    description: 'Admin notes',
    example: 'Status changed due to admin intervention',
  })
  @IsOptional()
  @IsString()
  adminNotes?: string;
}

/**
 * Response DTO for job actions
 */
export class JobActionResponseDto {
  @ApiProperty()
  success: boolean;

  @ApiProperty()
  message: string;

  @ApiProperty({ enum: JobStatus })
  previousStatus: JobStatus;

  @ApiProperty({ enum: JobStatus })
  newStatus: JobStatus;

  @ApiProperty()
  jobId: string;

  @ApiPropertyOptional()
  warnings?: string[];
}
