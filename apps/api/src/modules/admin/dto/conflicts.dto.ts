import { IsUUID, IsBoolean, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ConflictingMatchDto {
  @ApiProperty()
  matchId: string;

  @ApiProperty()
  jobId: string;

  @ApiProperty()
  jobTitle: string;

  @ApiProperty()
  employerId: string;

  @ApiPropertyOptional()
  employerName?: string;

  @ApiProperty()
  dateType: string;

  @ApiPropertyOptional()
  specificDate?: Date;

  @ApiProperty()
  timeSlot: string;

  @ApiProperty()
  confirmedAt: Date;
}

export class SchedulingConflictDto {
  @ApiProperty({ description: 'Unique conflict ID (hash of sorted match IDs)' })
  conflictId: string;

  @ApiProperty()
  candidateId: string;

  @ApiPropertyOptional()
  candidateName?: string;

  @ApiProperty({ type: [ConflictingMatchDto] })
  conflictingMatches: ConflictingMatchDto[];

  @ApiProperty()
  detectedAt: Date;

  @ApiProperty({ description: 'Severity: critical (same day), high (week overlap), medium (flexible dates)' })
  severity: 'critical' | 'high' | 'medium';

  @ApiProperty()
  conflictDescription: string;
}

export class GetConflictsResponseDto {
  @ApiProperty({ type: [SchedulingConflictDto] })
  data: SchedulingConflictDto[];

  @ApiProperty({
    type: 'object',
    properties: {
      total: { type: 'number' },
      criticalCount: { type: 'number' },
      highCount: { type: 'number' },
      mediumCount: { type: 'number' },
    },
  })
  meta: {
    total: number;
    criticalCount: number;
    highCount: number;
    mediumCount: number;
  };
}

export class ResolveConflictDto {
  @ApiProperty({
    description: 'Match ID to cancel to resolve the conflict',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  matchIdToCancel: string;

  @ApiProperty({
    description: 'Reason for cancelling the match',
    example: 'Scheduling conflict with another confirmed job',
  })
  @IsString()
  reason: string;

  @ApiPropertyOptional({
    description: 'Whether to notify the employer about the cancellation',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  notifyEmployer?: boolean;

  @ApiPropertyOptional({
    description: 'Whether to notify the candidate about the cancellation',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  notifyCandidate?: boolean;

  @ApiPropertyOptional({
    description: 'Additional admin notes',
  })
  @IsOptional()
  @IsString()
  adminNotes?: string;
}

export class ResolveConflictResponseDto {
  @ApiProperty()
  success: boolean;

  @ApiProperty()
  message: string;

  @ApiProperty()
  cancelledMatchId: string;

  @ApiProperty()
  conflictId: string;

  @ApiPropertyOptional()
  notificationsSent?: {
    employer: boolean;
    candidate: boolean;
  };
}
