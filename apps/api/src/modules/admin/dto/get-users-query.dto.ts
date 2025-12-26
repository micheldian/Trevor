import { IsOptional, IsEnum, IsString, IsNumber, Min, Max, IsBoolean } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Role } from '../../../common/enums/role.enum';

/**
 * Query DTO for GET /admin/users
 *
 * Supports pagination, filtering, and sorting
 */
export class GetUsersQueryDto {
  // Pagination
  @ApiPropertyOptional({ description: 'Page number (1-indexed)', minimum: 1, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Items per page', minimum: 1, maximum: 100, default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  // Filters - Role
  @ApiPropertyOptional({
    description: 'Filter by role',
    enum: Role,
    example: 'worker',
  })
  @IsOptional()
  @IsEnum(Role)
  role?: Role;

  // Filters - Status
  @ApiPropertyOptional({
    description: 'Filter by account status',
    enum: ['active', 'inactive', 'suspended'],
    example: 'active',
  })
  @IsOptional()
  @IsString()
  status?: 'active' | 'inactive' | 'suspended';

  @ApiPropertyOptional({
    description: 'Filter by verification status',
    type: Boolean,
    example: true,
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return undefined;
  })
  @IsBoolean()
  verified?: boolean;

  // Filters - Search
  @ApiPropertyOptional({
    description: 'Search by name, email, or phone',
    example: 'Jean Dupont',
  })
  @IsOptional()
  @IsString()
  q?: string;

  // Filters - Rating
  @ApiPropertyOptional({
    description: 'Minimum average rating',
    minimum: 0,
    maximum: 5,
    example: 4.0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(5)
  minRating?: number;

  // Filters - Vehicle
  @ApiPropertyOptional({
    description: 'Filter by vehicle ownership',
    type: Boolean,
    example: true,
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return undefined;
  })
  @IsBoolean()
  hasVehicle?: boolean;

  // Filters - Last Active
  @ApiPropertyOptional({
    description: 'Filter by last active date range (in days)',
    enum: [7, 30, 90],
    example: 30,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  lastActiveRange?: 7 | 30 | 90;

  // Sorting
  @ApiPropertyOptional({
    description: 'Sort field',
    enum: ['createdAt', 'lastSeenAt', 'ratingAvg', 'missionsCount'],
    default: 'createdAt',
  })
  @IsOptional()
  @IsString()
  sortBy?: 'createdAt' | 'lastSeenAt' | 'ratingAvg' | 'missionsCount' = 'createdAt';

  @ApiPropertyOptional({
    description: 'Sort order',
    enum: ['ASC', 'DESC'],
    default: 'DESC',
  })
  @IsOptional()
  @IsString()
  sortOrder?: 'ASC' | 'DESC' = 'DESC';
}
