import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, Not, LessThanOrEqual, MoreThanOrEqual, Like } from 'typeorm';
import { Review } from '../../reviews/entities/review.entity';
import { User } from '../../users/entities/user.entity';
import { AuditLogService } from '../../audit-log/audit-log.service';
import {
  GetAdminReviewsQueryDto,
  AdminReviewResponseDto,
  PaginatedAdminReviewsResponseDto,
  HideReviewDto,
  UpdateReviewContentDto,
} from '../dto/admin-reviews.dto';
import { Request } from 'express';

/**
 * Admin Reviews Service
 *
 * Handles review moderation for admin console
 */
@Injectable()
export class AdminReviewsService {
  private readonly logger = new Logger(AdminReviewsService.name);

  constructor(
    @InjectRepository(Review)
    private readonly reviewRepository: Repository<Review>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly auditLogService: AuditLogService,
  ) {}

  /**
   * Get paginated reviews with filters
   */
  async getReviews(
    query: GetAdminReviewsQueryDto,
  ): Promise<PaginatedAdminReviewsResponseDto> {
    const {
      page = 1,
      limit = 20,
      maxRating,
      minRating,
      flagged,
      hidden,
      includeDeleted = false,
      reviewerId,
      reviewedId,
      search,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
    } = query;

    const queryBuilder = this.reviewRepository
      .createQueryBuilder('review')
      .leftJoinAndSelect('review.reviewer', 'reviewer')
      .leftJoinAndSelect('review.reviewed', 'reviewed')
      .leftJoinAndSelect('reviewer.user', 'reviewerUser')
      .leftJoinAndSelect('reviewed.user', 'reviewedUser')
      .leftJoinAndSelect('review.hiddenBy', 'hiddenByUser')
      .leftJoinAndSelect('review.flaggedBy', 'flaggedByUser')
      .leftJoinAndSelect('review.moderatedBy', 'moderatedByUser');

    // Apply filters
    if (maxRating !== undefined) {
      queryBuilder.andWhere('review.rating <= :maxRating', { maxRating });
    }

    if (minRating !== undefined) {
      queryBuilder.andWhere('review.rating >= :minRating', { minRating });
    }

    if (flagged !== undefined) {
      queryBuilder.andWhere('review.is_flagged = :flagged', { flagged });
    }

    if (hidden !== undefined) {
      queryBuilder.andWhere('review.is_hidden = :hidden', { hidden });
    }

    if (reviewerId) {
      queryBuilder.andWhere('review.reviewer_id = :reviewerId', { reviewerId });
    }

    if (reviewedId) {
      queryBuilder.andWhere('review.reviewed_id = :reviewedId', { reviewedId });
    }

    if (search) {
      queryBuilder.andWhere('review.comment ILIKE :search', {
        search: `%${search}%`,
      });
    }

    // Handle soft deletes
    if (!includeDeleted) {
      queryBuilder.andWhere('review.deleted_at IS NULL');
    }

    // Count total
    const total = await queryBuilder.getCount();

    // Apply sorting
    const sortField = sortBy === 'createdAt' ? 'review.created_at' :
      sortBy === 'rating' ? 'review.rating' :
      sortBy === 'flaggedAt' ? 'review.flagged_at' :
      'review.created_at';

    queryBuilder.orderBy(sortField, sortOrder);

    // Apply pagination
    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    // Execute query
    const reviews = await queryBuilder.getMany();

    // Map to DTOs
    const data = reviews.map((review) => this.mapToDto(review));

    // Calculate pagination meta
    const totalPages = Math.ceil(total / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages,
        hasNext,
        hasPrev,
      },
    };
  }

  /**
   * Get single review by ID
   */
  async getReview(id: string): Promise<AdminReviewResponseDto> {
    const review = await this.reviewRepository.findOne({
      where: { id },
      relations: [
        'reviewer',
        'reviewed',
        'reviewer.user',
        'reviewed.user',
        'hiddenBy',
        'flaggedBy',
        'moderatedBy',
      ],
      withDeleted: true, // Include soft-deleted
    });

    if (!review) {
      throw new NotFoundException(`Review with ID ${id} not found`);
    }

    return this.mapToDto(review);
  }

  /**
   * Hide a review
   */
  async hideReview(
    reviewId: string,
    dto: HideReviewDto,
    adminUserId: string,
    request?: Request,
  ): Promise<AdminReviewResponseDto> {
    const review = await this.reviewRepository.findOne({
      where: { id: reviewId },
      relations: ['reviewer', 'reviewed', 'reviewer.user', 'reviewed.user'],
    });

    if (!review) {
      throw new NotFoundException(`Review with ID ${reviewId} not found`);
    }

    if (review.isHidden) {
      throw new BadRequestException('Review is already hidden');
    }

    // Capture before state
    const before = {
      isHidden: review.isHidden,
      hiddenReason: review.hiddenReason,
      hiddenAt: review.hiddenAt,
      hiddenById: review.hiddenById,
    };

    // Update review
    review.isHidden = true;
    review.hiddenReason = dto.reason;
    review.hiddenAt = new Date();
    review.hiddenById = adminUserId;
    review.moderatedById = adminUserId;
    review.moderatedAt = new Date();

    const updated = await this.reviewRepository.save(review);

    // Audit log
    await this.auditLogService.create({
      actorUserId: adminUserId,
      action: 'review.hidden',
      entityType: 'review',
      entityId: reviewId,
      beforeJson: before,
      afterJson: {
        isHidden: updated.isHidden,
        hiddenReason: updated.hiddenReason,
        hiddenAt: updated.hiddenAt,
        hiddenById: updated.hiddenById,
      },
      ...(request ? this.auditLogService.extractRequestMetadata(request) : {}),
      metadata: {
        description: 'Admin hid review',
        reason: dto.reason,
      },
    });

    this.logger.log(`Review ${reviewId} hidden by admin ${adminUserId}`);

    return this.mapToDto(updated);
  }

  /**
   * Unhide a review
   */
  async unhideReview(
    reviewId: string,
    adminUserId: string,
    request?: Request,
  ): Promise<AdminReviewResponseDto> {
    const review = await this.reviewRepository.findOne({
      where: { id: reviewId },
      relations: ['reviewer', 'reviewed', 'reviewer.user', 'reviewed.user'],
    });

    if (!review) {
      throw new NotFoundException(`Review with ID ${reviewId} not found`);
    }

    if (!review.isHidden) {
      throw new BadRequestException('Review is not hidden');
    }

    // Capture before state
    const before = {
      isHidden: review.isHidden,
      hiddenReason: review.hiddenReason,
      hiddenAt: review.hiddenAt,
      hiddenById: review.hiddenById,
    };

    // Update review
    review.isHidden = false;
    review.hiddenReason = undefined;
    review.hiddenAt = undefined;
    review.hiddenById = undefined;
    review.moderatedById = adminUserId;
    review.moderatedAt = new Date();

    const updated = await this.reviewRepository.save(review);

    // Audit log
    await this.auditLogService.create({
      actorUserId: adminUserId,
      action: 'review.unhidden',
      entityType: 'review',
      entityId: reviewId,
      beforeJson: before,
      afterJson: {
        isHidden: updated.isHidden,
      },
      ...(request ? this.auditLogService.extractRequestMetadata(request) : {}),
      metadata: {
        description: 'Admin unhid review',
      },
    });

    this.logger.log(`Review ${reviewId} unhidden by admin ${adminUserId}`);

    return this.mapToDto(updated);
  }

  /**
   * Soft delete a review
   */
  async deleteReview(
    reviewId: string,
    adminUserId: string,
    request?: Request,
  ): Promise<void> {
    const review = await this.reviewRepository.findOne({
      where: { id: reviewId },
      relations: ['reviewer', 'reviewed', 'reviewer.user', 'reviewed.user'],
    });

    if (!review) {
      throw new NotFoundException(`Review with ID ${reviewId} not found`);
    }

    if (review.deletedAt) {
      throw new BadRequestException('Review is already deleted');
    }

    // Capture before state
    const before = {
      id: review.id,
      rating: review.rating,
      comment: review.comment,
      isActive: review.isActive,
    };

    // Soft delete
    await this.reviewRepository.softDelete(reviewId);

    // Update moderation fields
    review.moderatedById = adminUserId;
    review.moderatedAt = new Date();
    await this.reviewRepository.save(review);

    // Audit log
    await this.auditLogService.create({
      actorUserId: adminUserId,
      action: 'review.deleted',
      entityType: 'review',
      entityId: reviewId,
      beforeJson: before,
      afterJson: {
        deletedAt: new Date(),
        moderatedById: adminUserId,
      },
      ...(request ? this.auditLogService.extractRequestMetadata(request) : {}),
      metadata: {
        description: 'Admin soft-deleted review',
      },
    });

    this.logger.log(`Review ${reviewId} soft-deleted by admin ${adminUserId}`);
  }

  /**
   * Update review content (optional admin edit)
   */
  async updateReview(
    reviewId: string,
    dto: UpdateReviewContentDto,
    adminUserId: string,
    request?: Request,
  ): Promise<AdminReviewResponseDto> {
    const review = await this.reviewRepository.findOne({
      where: { id: reviewId },
      relations: ['reviewer', 'reviewed', 'reviewer.user', 'reviewed.user'],
    });

    if (!review) {
      throw new NotFoundException(`Review with ID ${reviewId} not found`);
    }

    // Capture before state
    const before = {
      comment: review.comment,
      rating: review.rating,
    };

    // Update fields
    if (dto.comment !== undefined) {
      review.comment = dto.comment;
    }

    if (dto.rating !== undefined) {
      review.rating = dto.rating;
    }

    review.moderatedById = adminUserId;
    review.moderatedAt = new Date();

    const updated = await this.reviewRepository.save(review);

    // Audit log
    await this.auditLogService.create({
      actorUserId: adminUserId,
      action: 'review.updated',
      entityType: 'review',
      entityId: reviewId,
      beforeJson: before,
      afterJson: {
        comment: updated.comment,
        rating: updated.rating,
      },
      ...(request ? this.auditLogService.extractRequestMetadata(request) : {}),
      metadata: {
        description: 'Admin updated review content',
      },
    });

    this.logger.log(`Review ${reviewId} updated by admin ${adminUserId}`);

    return this.mapToDto(updated);
  }

  /**
   * Map Review entity to DTO
   */
  private mapToDto(review: Review): AdminReviewResponseDto {
    const reviewerUser = review.reviewer?.user;
    const reviewedUser = review.reviewed?.user;

    return {
      id: review.id,
      matchId: review.matchId,
      reviewerId: review.reviewerId,
      reviewerName: reviewerUser?.email || reviewerUser?.phone || 'Unknown',
      reviewedId: review.reviewedId,
      reviewedName: reviewedUser?.email || reviewedUser?.phone || 'Unknown',
      rating: parseFloat(review.rating.toString()),
      comment: review.comment,
      isHidden: review.isHidden,
      hiddenReason: review.hiddenReason || undefined,
      hiddenAt: review.hiddenAt || undefined,
      hiddenBy: review.hiddenBy?.email || review.hiddenBy?.phone || undefined,
      isFlagged: review.isFlagged,
      flagReason: review.flagReason || undefined,
      flaggedAt: review.flaggedAt || undefined,
      flaggedBy: review.flaggedBy?.email || review.flaggedBy?.phone || undefined,
      isActive: review.isActive,
      deletedAt: review.deletedAt || undefined,
      moderatedBy:
        review.moderatedBy?.email || review.moderatedBy?.phone || undefined,
      moderatedAt: review.moderatedAt || undefined,
      createdAt: review.createdAt,
      updatedAt: review.updatedAt,
    };
  }
}
