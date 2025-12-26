import {
  IsOptional,
  IsNumber,
  IsString,
  IsBoolean,
  IsUUID,
  IsEnum,
  Min,
  Max,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Query filters for admin reviews listing
 */
export class GetAdminReviewsQueryDto {
  @ApiPropertyOptional({ description: 'Page number', example: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Items per page',
    example: 20,
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @Type(() => Number)
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @ApiPropertyOptional({
    description: 'Filter by maximum rating (e.g., 2 for poor reviews)',
    example: 2,
    minimum: 1,
    maximum: 5,
  })
  @IsOptional()
  @Type(() => Number)
  @Min(1)
  @Max(5)
  maxRating?: number;

  @ApiPropertyOptional({
    description: 'Filter by minimum rating',
    example: 4,
    minimum: 1,
    maximum: 5,
  })
  @IsOptional()
  @Type(() => Number)
  @Min(1)
  @Max(5)
  minRating?: number;

  @ApiPropertyOptional({
    description: 'Filter flagged reviews only',
    example: true,
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  flagged?: boolean;

  @ApiPropertyOptional({
    description: 'Filter hidden reviews only',
    example: false,
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  hidden?: boolean;

  @ApiPropertyOptional({
    description: 'Include deleted reviews',
    example: false,
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  includeDeleted?: boolean;

  @ApiPropertyOptional({
    description: 'Filter by reviewer user ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsOptional()
  @IsUUID()
  reviewerId?: string;

  @ApiPropertyOptional({
    description: 'Filter by reviewed user ID',
    example: '660e8400-e29b-41d4-a716-446655440001',
  })
  @IsOptional()
  @IsUUID()
  reviewedId?: string;

  @ApiPropertyOptional({
    description: 'Search in comment text',
    example: 'late',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Sort by field',
    enum: ['createdAt', 'rating', 'flaggedAt'],
    example: 'createdAt',
  })
  @IsOptional()
  @IsEnum(['createdAt', 'rating', 'flaggedAt'])
  sortBy?: 'createdAt' | 'rating' | 'flaggedAt' = 'createdAt';

  @ApiPropertyOptional({
    description: 'Sort order',
    enum: ['ASC', 'DESC'],
    example: 'DESC',
  })
  @IsOptional()
  @IsEnum(['ASC', 'DESC'])
  sortOrder?: 'ASC' | 'DESC' = 'DESC';
}

/**
 * DTO for hiding a review
 */
export class HideReviewDto {
  @ApiProperty({
    description: 'Reason for hiding the review',
    example: 'Inappropriate language or spam content',
  })
  @IsString()
  reason: string;
}

/**
 * DTO for updating review content (optional admin edit)
 */
export class UpdateReviewContentDto {
  @ApiPropertyOptional({
    description: 'Updated comment text',
    example: 'Good worker, reliable and professional.',
  })
  @IsOptional()
  @IsString()
  comment?: string;

  @ApiPropertyOptional({
    description: 'Updated rating',
    minimum: 1,
    maximum: 5,
    example: 4,
  })
  @IsOptional()
  @Type(() => Number)
  @Min(1)
  @Max(5)
  rating?: number;
}

/**
 * Review response DTO for admin
 */
export class AdminReviewResponseDto {
  @ApiProperty({ description: 'Review ID' })
  id: string;

  @ApiProperty({ description: 'Match ID' })
  matchId: string;

  @ApiProperty({ description: 'Reviewer user ID' })
  reviewerId: string;

  @ApiProperty({ description: 'Reviewer email/phone' })
  reviewerName: string;

  @ApiProperty({ description: 'Reviewed user ID' })
  reviewedId: string;

  @ApiProperty({ description: 'Reviewed user email/phone' })
  reviewedName: string;

  @ApiProperty({ description: 'Rating (1-5)' })
  rating: number;

  @ApiPropertyOptional({ description: 'Comment text' })
  comment?: string;

  @ApiProperty({ description: 'Is hidden by admin' })
  isHidden: boolean;

  @ApiPropertyOptional({ description: 'Hidden reason' })
  hiddenReason?: string;

  @ApiPropertyOptional({ description: 'Hidden at timestamp' })
  hiddenAt?: Date;

  @ApiPropertyOptional({ description: 'Admin who hid the review' })
  hiddenBy?: string;

  @ApiProperty({ description: 'Is flagged for moderation' })
  isFlagged: boolean;

  @ApiPropertyOptional({ description: 'Flag reason' })
  flagReason?: string;

  @ApiPropertyOptional({ description: 'Flagged at timestamp' })
  flaggedAt?: Date;

  @ApiPropertyOptional({ description: 'User who flagged' })
  flaggedBy?: string;

  @ApiProperty({ description: 'Is active' })
  isActive: boolean;

  @ApiPropertyOptional({ description: 'Deleted at timestamp' })
  deletedAt?: Date;

  @ApiPropertyOptional({ description: 'Last moderated by' })
  moderatedBy?: string;

  @ApiPropertyOptional({ description: 'Last moderated at' })
  moderatedAt?: Date;

  @ApiProperty({ description: 'Created at' })
  createdAt: Date;

  @ApiProperty({ description: 'Updated at' })
  updatedAt: Date;
}

/**
 * Paginated reviews response
 */
export class PaginatedAdminReviewsResponseDto {
  @ApiProperty({ description: 'List of reviews', type: [AdminReviewResponseDto] })
  data: AdminReviewResponseDto[];

  @ApiProperty({
    description: 'Pagination metadata',
    example: {
      page: 1,
      limit: 20,
      total: 150,
      totalPages: 8,
      hasNext: true,
      hasPrev: false,
    },
  })
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}
