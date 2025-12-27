import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MatchStatus } from '../../matches/entities/match.entity';

export class AdminMatchJobDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  employerId: string;

  @ApiPropertyOptional()
  employerName?: string;

  @ApiProperty()
  status: string;
}

export class AdminMatchCandidateDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  userId: string;

  @ApiPropertyOptional()
  firstName?: string;

  @ApiPropertyOptional()
  lastName?: string;

  @ApiPropertyOptional()
  city?: string;

  @ApiProperty()
  type: string;
}

export class RiskFactorsDto {
  @ApiProperty({ description: 'Candidate has multiple matches for the same job' })
  duplicateMatch: boolean;

  @ApiProperty({ description: 'Multiple confirmed matches for the same job' })
  multipleConfirmed: boolean;

  @ApiProperty({ description: 'No status change after initial contact (stale)' })
  noResponse: boolean;

  @ApiProperty({ description: 'Match was whatsapp contacted but no progression' })
  contactedNoProgress: boolean;

  @ApiProperty({ description: 'Days since match was created' })
  daysSinceCreated: number;

  @ApiProperty({ description: 'Days since last status change' })
  daysSinceUpdate: number;
}

export class AdminMatchResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  jobId: string;

  @ApiProperty({ type: AdminMatchJobDto })
  job: AdminMatchJobDto;

  @ApiProperty()
  candidateId: string;

  @ApiProperty({ type: AdminMatchCandidateDto })
  candidate: AdminMatchCandidateDto;

  @ApiProperty({ enum: MatchStatus })
  status: MatchStatus;

  @ApiPropertyOptional()
  employerNotes?: string;

  @ApiPropertyOptional()
  candidateNotes?: string;

  @ApiProperty()
  whatsappContacted: boolean;

  @ApiPropertyOptional()
  whatsappContactedAt?: Date;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiPropertyOptional()
  interestedAt?: Date;

  @ApiPropertyOptional()
  rejectedAt?: Date;

  @ApiPropertyOptional()
  confirmedAt?: Date;

  @ApiPropertyOptional()
  completedAt?: Date;

  // Admin-specific calculated fields
  @ApiProperty({
    description: 'Risk score from 0-100 (higher = more suspicious)',
    example: 75,
  })
  riskScore: number;

  @ApiProperty({
    description: 'Detailed risk factors',
    type: RiskFactorsDto,
  })
  riskFactors: RiskFactorsDto;
}

export class GetMatchesResponseDto {
  @ApiProperty({ type: [AdminMatchResponseDto] })
  data: AdminMatchResponseDto[];

  @ApiProperty({
    type: 'object',
    properties: {
      total: { type: 'number' },
      limit: { type: 'number' },
      offset: { type: 'number' },
      hasMore: { type: 'boolean' },
      highRiskCount: { type: 'number' },
    },
  })
  meta: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
    highRiskCount: number;
  };
}
