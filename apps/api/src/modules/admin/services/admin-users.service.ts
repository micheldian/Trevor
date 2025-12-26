import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Brackets } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { GetUsersQueryDto } from '../dto/get-users-query.dto';
import {
  PaginatedUsersResponseDto,
  UserResponseDto,
  UserStatsDto,
  UserProfileSummaryDto,
} from '../dto/user-response.dto';

/**
 * Admin Users Service
 *
 * Handles user management operations for admin console
 */
@Injectable()
export class AdminUsersService {
  private readonly logger = new Logger(AdminUsersService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  /**
   * Get paginated users with filters
   */
  async getUsers(
    query: GetUsersQueryDto,
  ): Promise<PaginatedUsersResponseDto> {
    const {
      page = 1,
      limit = 20,
      role,
      status,
      verified,
      q,
      minRating,
      hasVehicle,
      lastActiveRange,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
    } = query;

    // Build query with eager loading of profiles
    const queryBuilder = this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.profiles', 'profile');

    // Filter by role
    if (role) {
      queryBuilder.andWhere('user.role = :role', { role });
    }

    // Filter by status
    if (status === 'active') {
      queryBuilder.andWhere('user.is_active = true');
    } else if (status === 'inactive') {
      queryBuilder.andWhere('user.is_active = false');
    } else if (status === 'suspended') {
      queryBuilder.andWhere('user.is_active = false');
    }

    // Filter by verification status
    if (verified !== undefined) {
      if (verified) {
        queryBuilder.andWhere(
          '(user.is_email_verified = true OR user.is_phone_verified = true)',
        );
      } else {
        queryBuilder.andWhere(
          '(user.is_email_verified = false AND user.is_phone_verified = false)',
        );
      }
    }

    // Search by name, email, or phone
    if (q) {
      queryBuilder.andWhere(
        new Brackets((qb) => {
          qb.where('user.email ILIKE :search', { search: `%${q}%` })
            .orWhere('user.phone ILIKE :search', { search: `%${q}%` })
            .orWhere('user.first_name ILIKE :search', { search: `%${q}%` })
            .orWhere('user.last_name ILIKE :search', { search: `%${q}%` })
            .orWhere('profile.first_name ILIKE :search', { search: `%${q}%` })
            .orWhere('profile.last_name ILIKE :search', { search: `%${q}%` })
            .orWhere('profile.team_name ILIKE :search', { search: `%${q}%` });
        }),
      );
    }

    // Filter by vehicle
    if (hasVehicle !== undefined) {
      if (hasVehicle) {
        queryBuilder.andWhere('profile.has_vehicle = true');
      } else {
        queryBuilder.andWhere(
          '(profile.has_vehicle = false OR profile.has_vehicle IS NULL)',
        );
      }
    }

    // Filter by last active range
    if (lastActiveRange) {
      const daysAgo = new Date();
      daysAgo.setDate(daysAgo.getDate() - lastActiveRange);

      queryBuilder.andWhere(
        new Brackets((qb) => {
          qb.where('user.last_seen_at >= :daysAgo', { daysAgo })
            .orWhere('user.last_login_at >= :daysAgo', { daysAgo })
            .orWhere('user.updated_at >= :daysAgo', { daysAgo });
        }),
      );
    }

    // Clone query for counting
    const countQuery = queryBuilder.clone();

    // Sorting
    // For rating and missions count, we need to add subqueries
    if (sortBy === 'ratingAvg') {
      // Add subquery for rating average
      queryBuilder
        .leftJoin('reviews', 'review', 'review.reviewee_id = user.id')
        .addSelect('COALESCE(AVG(review.rating), 0)', 'rating_avg')
        .groupBy('user.id')
        .addGroupBy('profile.id')
        .orderBy('rating_avg', sortOrder);
    } else if (sortBy === 'missionsCount') {
      // Add subquery for missions count
      queryBuilder
        .leftJoin('matches', 'match', 'match.candidate_id = profile.id')
        .addSelect(
          `COUNT(DISTINCT CASE WHEN match.status = 'completed' THEN match.id END)`,
          'missions_count',
        )
        .groupBy('user.id')
        .addGroupBy('profile.id')
        .orderBy('missions_count', sortOrder);
    } else if (sortBy === 'lastSeenAt') {
      queryBuilder.orderBy('user.last_seen_at', sortOrder, 'NULLS LAST');
    } else {
      // Default sorting by createdAt
      queryBuilder.orderBy(`user.${sortBy}`, sortOrder);
    }

    // Pagination
    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    // Execute queries
    const [users, total] = await Promise.all([
      queryBuilder.getMany(),
      countQuery.getCount(),
    ]);

    // Get user IDs for stats query
    const userIds = users.map((u) => u.id);

    // Fetch statistics for all users in one query
    const stats = await this.getUsersStats(userIds);

    // Map to response DTOs
    const data = users.map((user) => this.mapUserToDto(user, stats[user.id]));

    // Calculate pagination metadata
    const totalPages = Math.ceil(total / limit);

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  }

  /**
   * Get statistics for multiple users
   */
  private async getUsersStats(
    userIds: string[],
  ): Promise<Record<string, UserStatsDto>> {
    if (userIds.length === 0) {
      return {};
    }

    // Query to get rating average and missions count for each user
    const statsQuery = `
      SELECT
        u.id AS user_id,
        COALESCE(AVG(r.rating), 0) AS rating_avg,
        COUNT(DISTINCT CASE WHEN m.status = 'completed' THEN m.id END) AS missions_count,
        GREATEST(
          COALESCE(MAX(m.updated_at), u.created_at),
          COALESCE(MAX(r.created_at), u.created_at),
          COALESCE(u.last_seen_at, u.created_at),
          COALESCE(u.last_login_at, u.created_at)
        ) AS last_seen_at
      FROM users u
      LEFT JOIN profiles p ON p.user_id = u.id
      LEFT JOIN matches m ON m.candidate_id = p.id
      LEFT JOIN reviews r ON r.reviewee_id = u.id
      WHERE u.id = ANY($1)
      GROUP BY u.id, u.created_at, u.last_seen_at, u.last_login_at
    `;

    const results = await this.userRepository.query(statsQuery, [userIds]);

    // Map results to dictionary
    const statsMap: Record<string, UserStatsDto> = {};

    for (const row of results) {
      statsMap[row.user_id] = {
        ratingAvg: parseFloat(row.rating_avg) || 0,
        missionsCount: parseInt(row.missions_count, 10) || 0,
        lastSeenAt: row.last_seen_at || null,
      };
    }

    return statsMap;
  }

  /**
   * Filter users by minimum rating
   */
  private async filterByMinRating(
    users: User[],
    stats: Record<string, UserStatsDto>,
    minRating: number,
  ): Promise<User[]> {
    return users.filter((user) => {
      const userStats = stats[user.id];
      return userStats && userStats.ratingAvg >= minRating;
    });
  }

  /**
   * Map User entity to DTO
   */
  private mapUserToDto(user: User, stats?: UserStatsDto): UserResponseDto {
    return {
      id: user.id,
      email: user.email,
      phone: user.phone,
      role: user.role,
      isActive: user.isActive,
      isEmailVerified: user.isEmailVerified || false,
      isPhoneVerified: user.isPhoneVerified || false,
      createdAt: user.createdAt,
      lastLoginAt: user.lastLoginAt,
      stats: stats || {
        ratingAvg: 0,
        missionsCount: 0,
        lastSeenAt: null,
      },
      profiles: user.profiles?.map((profile) => this.mapProfileToDto(profile)) || [],
    };
  }

  /**
   * Map Profile to summary DTO
   */
  private mapProfileToDto(profile: any): UserProfileSummaryDto {
    return {
      id: profile.id,
      type: profile.type,
      firstName: profile.firstName,
      lastName: profile.lastName,
      teamName: profile.teamName,
      hasVehicle: profile.hasVehicle,
      skills: profile.skills || [],
      cultures: profile.cultures || [],
    };
  }
}
