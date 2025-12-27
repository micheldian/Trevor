import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { JobStatus, JobDateType, JobTimeSlot } from '../../jobs/entities/job.entity';

export class AdminJobEmployerDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  userId: string;

  @ApiPropertyOptional()
  city?: string;

  @ApiPropertyOptional()
  postalCode?: string;

  @ApiProperty()
  type: string;

  @ApiPropertyOptional()
  firstName?: string;

  @ApiPropertyOptional()
  lastName?: string;

  @ApiPropertyOptional()
  avatarUrl?: string;
}

export class AdminJobResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  employerId: string;

  @ApiProperty({ type: AdminJobEmployerDto })
  employer: AdminJobEmployerDto;

  @ApiProperty()
  title: string;

  @ApiPropertyOptional()
  description?: string;

  @ApiProperty()
  culture: string;

  @ApiProperty({ type: [String] })
  tags: string[];

  @ApiProperty({ type: [String] })
  requiredSkills: string[];

  @ApiProperty({ enum: JobDateType })
  dateType: JobDateType;

  @ApiPropertyOptional()
  specificDate?: Date;

  @ApiProperty({ enum: JobTimeSlot })
  timeSlot: JobTimeSlot;

  @ApiProperty()
  nbPeople: number;

  @ApiProperty()
  latitude: number;

  @ApiProperty()
  longitude: number;

  @ApiPropertyOptional()
  address?: string;

  @ApiPropertyOptional()
  city?: string;

  @ApiPropertyOptional()
  postalCode?: string;

  @ApiProperty({ enum: JobStatus })
  status: JobStatus;

  @ApiPropertyOptional()
  hourlyRate?: number;

  @ApiPropertyOptional()
  estimatedHours?: number;

  @ApiProperty()
  isUrgent: boolean;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiPropertyOptional()
  publishedAt?: Date;

  @ApiPropertyOptional()
  confirmedAt?: Date;

  @ApiPropertyOptional()
  completedAt?: Date;

  @ApiPropertyOptional()
  cancelledAt?: Date;

  @ApiPropertyOptional()
  cancellationReason?: string;

  // Admin-specific fields
  @ApiProperty({ description: 'Number of matches for this job' })
  nbMatches: number;

  @ApiPropertyOptional({ description: 'ID of the confirmed match, if any' })
  confirmedMatchId?: string;

  @ApiPropertyOptional({ description: 'Distance in km from search coordinates' })
  distance?: number;
}

export class GetJobsResponseDto {
  @ApiProperty({ type: [AdminJobResponseDto] })
  data: AdminJobResponseDto[];

  @ApiProperty({
    type: 'object',
    properties: {
      total: { type: 'number' },
      limit: { type: 'number' },
      offset: { type: 'number' },
      hasMore: { type: 'boolean' },
    },
  })
  meta: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}
