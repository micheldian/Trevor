import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Role } from '../../../common/enums/role.enum';

/**
 * User statistics DTO
 */
export class UserStatsDto {
  @ApiProperty({ description: 'Average rating', example: 4.5 })
  ratingAvg: number;

  @ApiProperty({ description: 'Total missions completed', example: 23 })
  missionsCount: number;

  @ApiPropertyOptional({ description: 'Last seen timestamp', example: '2024-09-25T14:30:00Z' })
  lastSeenAt: Date | null;
}

/**
 * User profile summary DTO
 */
export class UserProfileSummaryDto {
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

  @ApiPropertyOptional({ description: 'Has vehicle', example: true })
  hasVehicle?: boolean;

  @ApiPropertyOptional({ description: 'Skills', example: ['harvest', 'planting'] })
  skills?: string[];

  @ApiPropertyOptional({ description: 'Cultures', example: ['grapes', 'wheat'] })
  cultures?: string[];
}

/**
 * User response DTO
 */
export class UserResponseDto {
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

  @ApiProperty({ description: 'Account creation date', example: '2024-01-15T10:00:00Z' })
  createdAt: Date;

  @ApiPropertyOptional({ description: 'Last login date', example: '2024-09-25T14:30:00Z' })
  lastLoginAt?: Date;

  @ApiProperty({ description: 'User statistics', type: UserStatsDto })
  stats: UserStatsDto;

  @ApiProperty({ description: 'User profiles', type: [UserProfileSummaryDto] })
  profiles: UserProfileSummaryDto[];
}

/**
 * Pagination metadata DTO
 */
export class PaginationMetaDto {
  @ApiProperty({ description: 'Current page', example: 1 })
  page: number;

  @ApiProperty({ description: 'Items per page', example: 20 })
  limit: number;

  @ApiProperty({ description: 'Total items', example: 157 })
  total: number;

  @ApiProperty({ description: 'Total pages', example: 8 })
  totalPages: number;

  @ApiProperty({ description: 'Has next page', example: true })
  hasNext: boolean;

  @ApiProperty({ description: 'Has previous page', example: false })
  hasPrev: boolean;
}

/**
 * Paginated users response DTO
 */
export class PaginatedUsersResponseDto {
  @ApiProperty({ description: 'List of users', type: [UserResponseDto] })
  data: UserResponseDto[];

  @ApiProperty({ description: 'Pagination metadata', type: PaginationMetaDto })
  meta: PaginationMetaDto;
}
