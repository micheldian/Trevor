import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Role } from '../../../common/enums/role.enum';

/**
 * Detailed profile DTO
 */
export class DetailedProfileDto {
  @ApiProperty({ description: 'Profile ID', example: 'uuid' })
  id: string;

  @ApiProperty({ description: 'Profile type', enum: ['individual', 'team'] })
  type: 'individual' | 'team';

  @ApiPropertyOptional({ description: 'First name', example: 'Jean' })
  firstName?: string;

  @ApiPropertyOptional({ description: 'Last name', example: 'Dupont' })
  lastName?: string;

  @ApiPropertyOptional({ description: 'Team name', example: 'Équipe Dupont' })
  teamName?: string;

  @ApiPropertyOptional({ description: 'Bio/description' })
  bio?: string;

  @ApiPropertyOptional({ description: 'Years of experience', example: 5 })
  experienceYears?: number;

  @ApiPropertyOptional({ description: 'Has vehicle', example: true })
  hasVehicle?: boolean;

  @ApiPropertyOptional({ description: 'Skills', example: ['harvest', 'planting'] })
  skills?: string[];

  @ApiPropertyOptional({ description: 'Cultures', example: ['grapes', 'wheat'] })
  cultures?: string[];

  @ApiPropertyOptional({ description: 'Location' })
  location?: {
    address?: string;
    city?: string;
    region?: string;
    coordinates?: { lat: number; lng: number };
  };

  @ApiProperty({ description: 'Creation date' })
  createdAt: Date;

  @ApiProperty({ description: 'Update date' })
  updatedAt: Date;
}

/**
 * Availability DTO
 */
export class AvailabilityDto {
  @ApiProperty({ description: 'Availability ID', example: 'uuid' })
  id: string;

  @ApiProperty({ description: 'Profile ID', example: 'uuid' })
  profileId: string;

  @ApiProperty({ description: 'Start date', example: '2024-10-01' })
  startDate: Date;

  @ApiProperty({ description: 'End date', example: '2024-10-15' })
  endDate: Date;

  @ApiPropertyOptional({ description: 'Status', example: 'available' })
  status?: string;

  @ApiProperty({ description: 'Creation date' })
  createdAt: Date;
}

/**
 * Job summary DTO
 */
export class JobSummaryDto {
  @ApiProperty({ description: 'Job ID', example: 'uuid' })
  id: string;

  @ApiProperty({ description: 'Job title', example: 'Grape Harvest' })
  title: string;

  @ApiProperty({ description: 'Culture', example: 'grapes' })
  culture: string;

  @ApiProperty({ description: 'Job status', example: 'published' })
  status: string;

  @ApiProperty({ description: 'Start date', example: '2024-09-15' })
  startDate: Date;

  @ApiPropertyOptional({ description: 'End date', example: '2024-09-20' })
  endDate?: Date;

  @ApiProperty({ description: 'Workers needed', example: 5 })
  workersNeeded: number;

  @ApiProperty({ description: 'Creation date' })
  createdAt: Date;
}

/**
 * Match summary DTO
 */
export class MatchSummaryDto {
  @ApiProperty({ description: 'Match ID', example: 'uuid' })
  id: string;

  @ApiProperty({ description: 'Job info' })
  job: {
    id: string;
    title: string;
    culture: string;
  };

  @ApiProperty({ description: 'Candidate info' })
  candidate: {
    id: string;
    name: string;
    type: string;
  };

  @ApiProperty({ description: 'Match status', example: 'confirmed' })
  status: string;

  @ApiProperty({ description: 'Match score', example: 95 })
  matchScore?: number;

  @ApiProperty({ description: 'Creation date' })
  createdAt: Date;

  @ApiPropertyOptional({ description: 'Confirmed date' })
  confirmedAt?: Date;

  @ApiPropertyOptional({ description: 'Completed date' })
  completedAt?: Date;
}

/**
 * Review DTO
 */
export class ReviewDto {
  @ApiProperty({ description: 'Review ID', example: 'uuid' })
  id: string;

  @ApiProperty({ description: 'Reviewer info' })
  reviewer: {
    id: string;
    name: string;
  };

  @ApiProperty({ description: 'Rating', example: 4.5, minimum: 0, maximum: 5 })
  rating: number;

  @ApiPropertyOptional({ description: 'Comment' })
  comment?: string;

  @ApiPropertyOptional({ description: 'Job ID', example: 'uuid' })
  jobId?: string;

  @ApiPropertyOptional({ description: 'Job title' })
  jobTitle?: string;

  @ApiProperty({ description: 'Creation date' })
  createdAt: Date;
}

/**
 * Audit log DTO
 */
export class AuditLogDto {
  @ApiProperty({ description: 'Log ID', example: 'uuid' })
  id: string;

  @ApiProperty({ description: 'Action performed', example: 'user.verified' })
  action: string;

  @ApiProperty({ description: 'Actor (admin) info' })
  actor: {
    id: string;
    email?: string;
    phone?: string;
  };

  @ApiPropertyOptional({ description: 'Before state (JSON)' })
  beforeJson?: any;

  @ApiPropertyOptional({ description: 'After state (JSON)' })
  afterJson?: any;

  @ApiPropertyOptional({ description: 'IP address' })
  ipAddress?: string;

  @ApiPropertyOptional({ description: 'Metadata' })
  metadata?: any;

  @ApiProperty({ description: 'Timestamp' })
  createdAt: Date;
}

/**
 * Detailed statistics DTO
 */
export class DetailedStatsDto {
  @ApiProperty({ description: 'Average rating', example: 4.5 })
  ratingAvg: number;

  @ApiProperty({ description: 'Total reviews received', example: 12 })
  reviewsCount: number;

  @ApiProperty({ description: 'Total missions completed', example: 23 })
  missionsCount: number;

  @ApiProperty({ description: 'Total matches', example: 30 })
  matchesTotal: number;

  @ApiProperty({ description: 'Matches by status' })
  matchesByStatus: {
    pending: number;
    confirmed: number;
    completed: number;
    cancelled: number;
  };

  @ApiPropertyOptional({ description: 'Jobs posted (if employer)', example: 8 })
  jobsPosted?: number;

  @ApiPropertyOptional({ description: 'Last seen timestamp' })
  lastSeenAt?: Date;

  @ApiPropertyOptional({ description: 'Last login timestamp' })
  lastLoginAt?: Date;

  @ApiProperty({ description: 'Account age in days', example: 123 })
  accountAgeDays: number;
}

/**
 * Detailed user response DTO
 */
export class DetailedUserResponseDto {
  // Basic user info
  @ApiProperty({ description: 'User ID', example: 'uuid' })
  id: string;

  @ApiPropertyOptional({ description: 'Email', example: 'jean.dupont@email.com' })
  email?: string;

  @ApiPropertyOptional({ description: 'Phone number', example: '+33 6 12 34 56 78' })
  phone?: string;

  @ApiProperty({ description: 'Role', enum: Role, example: 'worker' })
  role: Role;

  @ApiProperty({ description: 'Account active status', example: true })
  isActive: boolean;

  @ApiProperty({ description: 'Email verified status', example: true })
  isEmailVerified: boolean;

  @ApiProperty({ description: 'Phone verified status', example: true })
  isPhoneVerified: boolean;

  @ApiPropertyOptional({ description: 'First name', example: 'Jean' })
  firstName?: string;

  @ApiPropertyOptional({ description: 'Last name', example: 'Dupont' })
  lastName?: string;

  @ApiPropertyOptional({ description: 'Avatar URL' })
  avatarUrl?: string;

  @ApiProperty({ description: 'Account creation date' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update date' })
  updatedAt: Date;

  @ApiPropertyOptional({ description: 'Last login date' })
  lastLoginAt?: Date;

  @ApiPropertyOptional({ description: 'Last seen date' })
  lastSeenAt?: Date;

  // Detailed data
  @ApiProperty({ description: 'User profiles', type: [DetailedProfileDto] })
  profiles: DetailedProfileDto[];

  @ApiProperty({ description: 'Recent availabilities', type: [AvailabilityDto] })
  availabilities: AvailabilityDto[];

  @ApiProperty({ description: 'Related jobs', type: [JobSummaryDto] })
  jobs: JobSummaryDto[];

  @ApiProperty({ description: 'Related matches', type: [MatchSummaryDto] })
  matches: MatchSummaryDto[];

  @ApiProperty({ description: 'Reviews received', type: [ReviewDto] })
  reviews: ReviewDto[];

  @ApiProperty({ description: 'Audit logs', type: [AuditLogDto] })
  auditLogs: AuditLogDto[];

  @ApiProperty({ description: 'Detailed statistics', type: DetailedStatsDto })
  stats: DetailedStatsDto;
}
