import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Brackets } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { UserStatus } from '../../../common/enums/user-status.enum';
import { AuditLogService } from '../../audit-log/audit-log.service';
import { GetUsersQueryDto } from '../dto/get-users-query.dto';
import {
  PaginatedUsersResponseDto,
  UserResponseDto,
  UserStatsDto,
  UserProfileSummaryDto,
} from '../dto/user-response.dto';
import {
  DetailedUserResponseDto,
  DetailedProfileDto,
  AvailabilityDto,
  JobSummaryDto,
  MatchSummaryDto,
  ReviewDto,
  AuditLogDto,
  DetailedStatsDto,
} from '../dto/detailed-user-response.dto';
import { Request } from 'express';

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
    private readonly auditLogService: AuditLogService,
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

  /**
   * Get detailed user by ID
   */
  async getUserById(userId: string): Promise<DetailedUserResponseDto> {
    // Get user with profiles
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['profiles'],
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    // Get profile IDs for related queries
    const profileIds = user.profiles?.map((p) => p.id) || [];

    // Fetch all related data in parallel
    const [
      profiles,
      availabilities,
      jobs,
      matches,
      reviews,
      auditLogs,
      stats,
    ] = await Promise.all([
      this.getUserProfiles(userId),
      this.getUserAvailabilities(profileIds),
      this.getUserJobs(userId, user.role),
      this.getUserMatches(profileIds, userId, user.role),
      this.getUserReviews(userId),
      this.getUserAuditLogs(userId),
      this.getUserDetailedStats(userId, profileIds),
    ]);

    // Map to detailed DTO
    return {
      id: user.id,
      email: user.email,
      phone: user.phone,
      role: user.role,
      isActive: user.isActive,
      isEmailVerified: user.isEmailVerified || false,
      isPhoneVerified: user.isPhoneVerified || false,
      firstName: user.firstName,
      lastName: user.lastName,
      avatarUrl: user.avatarUrl,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      lastLoginAt: user.lastLoginAt,
      lastSeenAt: user.lastSeenAt,
      profiles,
      availabilities,
      jobs,
      matches,
      reviews,
      auditLogs,
      stats,
    };
  }

  /**
   * Get user profiles with full details
   */
  private async getUserProfiles(userId: string): Promise<DetailedProfileDto[]> {
    const query = `
      SELECT
        p.id,
        p.type,
        p.first_name,
        p.last_name,
        p.team_name,
        p.bio,
        p.experience_years,
        p.has_vehicle,
        p.skills,
        p.cultures,
        p.location_address,
        p.location_city,
        p.location_region,
        p.location_lat,
        p.location_lng,
        p.created_at,
        p.updated_at
      FROM profiles p
      WHERE p.user_id = $1
      ORDER BY p.created_at DESC
    `;

    const results = await this.userRepository.query(query, [userId]);

    return results.map((row: any) => ({
      id: row.id,
      type: row.type,
      firstName: row.first_name,
      lastName: row.last_name,
      teamName: row.team_name,
      bio: row.bio,
      experienceYears: row.experience_years,
      hasVehicle: row.has_vehicle,
      skills: row.skills || [],
      cultures: row.cultures || [],
      location: {
        address: row.location_address,
        city: row.location_city,
        region: row.location_region,
        coordinates: row.location_lat && row.location_lng
          ? { lat: parseFloat(row.location_lat), lng: parseFloat(row.location_lng) }
          : undefined,
      },
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));
  }

  /**
   * Get user availabilities (recent ones)
   */
  private async getUserAvailabilities(profileIds: string[]): Promise<AvailabilityDto[]> {
    if (profileIds.length === 0) return [];

    const query = `
      SELECT
        a.id,
        a.profile_id,
        a.start_date,
        a.end_date,
        a.status,
        a.created_at
      FROM availabilities a
      WHERE a.profile_id = ANY($1)
      AND a.end_date >= CURRENT_DATE - INTERVAL '30 days'
      ORDER BY a.start_date DESC
      LIMIT 10
    `;

    const results = await this.userRepository.query(query, [profileIds]);

    return results.map((row: any) => ({
      id: row.id,
      profileId: row.profile_id,
      startDate: row.start_date,
      endDate: row.end_date,
      status: row.status,
      createdAt: row.created_at,
    }));
  }

  /**
   * Get user jobs (if employer)
   */
  private async getUserJobs(userId: string, role: string): Promise<JobSummaryDto[]> {
    if (role !== 'employer' && role !== 'admin') return [];

    const query = `
      SELECT
        j.id,
        j.title,
        j.culture,
        j.status,
        j.start_date,
        j.end_date,
        j.workers_needed,
        j.created_at
      FROM jobs j
      WHERE j.employer_id = $1
      ORDER BY j.created_at DESC
      LIMIT 20
    `;

    const results = await this.userRepository.query(query, [userId]);

    return results.map((row: any) => ({
      id: row.id,
      title: row.title,
      culture: row.culture,
      status: row.status,
      startDate: row.start_date,
      endDate: row.end_date,
      workersNeeded: row.workers_needed,
      createdAt: row.created_at,
    }));
  }

  /**
   * Get user matches (as candidate or employer)
   */
  private async getUserMatches(
    profileIds: string[],
    userId: string,
    role: string,
  ): Promise<MatchSummaryDto[]> {
    if (profileIds.length === 0 && role !== 'employer') return [];

    // Build query based on role
    let query: string;
    let params: any[];

    if (role === 'employer' || role === 'admin') {
      // Get matches for jobs posted by this user
      query = `
        SELECT
          m.id,
          m.status,
          m.match_score,
          m.created_at,
          m.confirmed_at,
          m.completed_at,
          j.id as job_id,
          j.title as job_title,
          j.culture as job_culture,
          p.id as candidate_id,
          COALESCE(p.team_name, CONCAT(p.first_name, ' ', p.last_name)) as candidate_name,
          p.type as candidate_type
        FROM matches m
        INNER JOIN jobs j ON j.id = m.job_id
        INNER JOIN profiles p ON p.id = m.candidate_id
        WHERE j.employer_id = $1
        ORDER BY m.created_at DESC
        LIMIT 30
      `;
      params = [userId];
    } else {
      // Get matches where user is the candidate
      query = `
        SELECT
          m.id,
          m.status,
          m.match_score,
          m.created_at,
          m.confirmed_at,
          m.completed_at,
          j.id as job_id,
          j.title as job_title,
          j.culture as job_culture,
          p.id as candidate_id,
          COALESCE(p.team_name, CONCAT(p.first_name, ' ', p.last_name)) as candidate_name,
          p.type as candidate_type
        FROM matches m
        INNER JOIN jobs j ON j.id = m.job_id
        INNER JOIN profiles p ON p.id = m.candidate_id
        WHERE m.candidate_id = ANY($1)
        ORDER BY m.created_at DESC
        LIMIT 30
      `;
      params = [profileIds];
    }

    const results = await this.userRepository.query(query, params);

    return results.map((row: any) => ({
      id: row.id,
      job: {
        id: row.job_id,
        title: row.job_title,
        culture: row.job_culture,
      },
      candidate: {
        id: row.candidate_id,
        name: row.candidate_name,
        type: row.candidate_type,
      },
      status: row.status,
      matchScore: row.match_score,
      createdAt: row.created_at,
      confirmedAt: row.confirmed_at,
      completedAt: row.completed_at,
    }));
  }

  /**
   * Get reviews received by user
   */
  private async getUserReviews(userId: string): Promise<ReviewDto[]> {
    const query = `
      SELECT
        r.id,
        r.rating,
        r.comment,
        r.job_id,
        r.created_at,
        u.id as reviewer_id,
        COALESCE(u.email, u.phone) as reviewer_name,
        j.title as job_title
      FROM reviews r
      INNER JOIN users u ON u.id = r.reviewer_id
      LEFT JOIN jobs j ON j.id = r.job_id
      WHERE r.reviewee_id = $1
      ORDER BY r.created_at DESC
      LIMIT 50
    `;

    const results = await this.userRepository.query(query, [userId]);

    return results.map((row: any) => ({
      id: row.id,
      reviewer: {
        id: row.reviewer_id,
        name: row.reviewer_name,
      },
      rating: parseFloat(row.rating),
      comment: row.comment,
      jobId: row.job_id,
      jobTitle: row.job_title,
      createdAt: row.created_at,
    }));
  }

  /**
   * Get audit logs for user
   */
  private async getUserAuditLogs(userId: string): Promise<AuditLogDto[]> {
    const query = `
      SELECT
        a.id,
        a.action,
        a.actor_user_id,
        a.before_json,
        a.after_json,
        a.ip_address,
        a.metadata,
        a.created_at,
        u.email as actor_email,
        u.phone as actor_phone
      FROM audit_logs a
      LEFT JOIN users u ON u.id = a.actor_user_id
      WHERE a.entity_type = 'user' AND a.entity_id = $1
      ORDER BY a.created_at DESC
      LIMIT 50
    `;

    const results = await this.userRepository.query(query, [userId]);

    return results.map((row: any) => ({
      id: row.id,
      action: row.action,
      actor: {
        id: row.actor_user_id,
        email: row.actor_email,
        phone: row.actor_phone,
      },
      beforeJson: row.before_json,
      afterJson: row.after_json,
      ipAddress: row.ip_address,
      metadata: row.metadata,
      createdAt: row.created_at,
    }));
  }

  /**
   * Get detailed statistics for user
   */
  private async getUserDetailedStats(
    userId: string,
    profileIds: string[],
  ): Promise<DetailedStatsDto> {
    const query = `
      SELECT
        -- Rating stats
        COALESCE(AVG(r.rating), 0) as rating_avg,
        COUNT(DISTINCT r.id) as reviews_count,

        -- Match stats
        COUNT(DISTINCT m.id) as matches_total,
        COUNT(DISTINCT CASE WHEN m.status = 'pending' THEN m.id END) as matches_pending,
        COUNT(DISTINCT CASE WHEN m.status = 'confirmed' THEN m.id END) as matches_confirmed,
        COUNT(DISTINCT CASE WHEN m.status = 'completed' THEN m.id END) as matches_completed,
        COUNT(DISTINCT CASE WHEN m.status = 'cancelled' THEN m.id END) as matches_cancelled,

        -- Jobs posted (if employer)
        COUNT(DISTINCT j.id) as jobs_posted

      FROM users u
      LEFT JOIN profiles p ON p.user_id = u.id
      LEFT JOIN matches m ON m.candidate_id = p.id
      LEFT JOIN reviews r ON r.reviewee_id = u.id
      LEFT JOIN jobs j ON j.employer_id = u.id
      WHERE u.id = $1
      GROUP BY u.id
    `;

    const results = await this.userRepository.query(query, [userId]);

    if (results.length === 0) {
      throw new NotFoundException(`User stats not found for ID ${userId}`);
    }

    const row = results[0];

    // Get user for account age and last seen
    const user = await this.userRepository.findOne({
      where: { id: userId },
      select: ['createdAt', 'lastSeenAt', 'lastLoginAt'],
    });

    const accountAgeDays = user
      ? Math.floor((Date.now() - user.createdAt.getTime()) / (1000 * 60 * 60 * 24))
      : 0;

    return {
      ratingAvg: parseFloat(row.rating_avg) || 0,
      reviewsCount: parseInt(row.reviews_count, 10) || 0,
      missionsCount: parseInt(row.matches_completed, 10) || 0,
      matchesTotal: parseInt(row.matches_total, 10) || 0,
      matchesByStatus: {
        pending: parseInt(row.matches_pending, 10) || 0,
        confirmed: parseInt(row.matches_confirmed, 10) || 0,
        completed: parseInt(row.matches_completed, 10) || 0,
        cancelled: parseInt(row.matches_cancelled, 10) || 0,
      },
      jobsPosted: parseInt(row.jobs_posted, 10) || 0,
      lastSeenAt: user?.lastSeenAt,
      lastLoginAt: user?.lastLoginAt,
      accountAgeDays,
    };
  }

  /**
   * Verify a user
   * Sets isVerified to true, records verification timestamp and admin
   */
  async verifyUser(
    userId: string,
    adminUserId: string,
    request?: Request,
  ): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    // Capture before state
    const before = {
      isVerified: user.isVerified,
      verifiedAt: user.verifiedAt,
      verifiedById: user.verifiedById,
    };

    // Update user
    user.isVerified = true;
    user.verifiedAt = new Date();
    user.verifiedById = adminUserId;

    const updatedUser = await this.userRepository.save(user);

    // Capture after state
    const after = {
      isVerified: updatedUser.isVerified,
      verifiedAt: updatedUser.verifiedAt,
      verifiedById: updatedUser.verifiedById,
    };

    // Log to audit
    await this.auditLogService.create({
      actorUserId: adminUserId,
      action: 'user.verified',
      entityType: 'user',
      entityId: userId,
      beforeJson: before,
      afterJson: after,
      ...(request ? this.auditLogService.extractRequestMetadata(request) : {}),
      metadata: {
        description: 'Admin verified user account',
      },
    });

    this.logger.log(
      `User ${userId} verified by admin ${adminUserId}`,
    );

    return updatedUser;
  }

  /**
   * Unverify a user
   * Sets isVerified to false, clears verification timestamp and admin
   */
  async unverifyUser(
    userId: string,
    adminUserId: string,
    request?: Request,
  ): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    // Capture before state
    const before = {
      isVerified: user.isVerified,
      verifiedAt: user.verifiedAt,
      verifiedById: user.verifiedById,
    };

    // Update user
    user.isVerified = false;
    user.verifiedAt = undefined;
    user.verifiedById = undefined;

    const updatedUser = await this.userRepository.save(user);

    // Capture after state
    const after = {
      isVerified: updatedUser.isVerified,
      verifiedAt: updatedUser.verifiedAt,
      verifiedById: updatedUser.verifiedById,
    };

    // Log to audit
    await this.auditLogService.create({
      actorUserId: adminUserId,
      action: 'user.unverified',
      entityType: 'user',
      entityId: userId,
      beforeJson: before,
      afterJson: after,
      ...(request ? this.auditLogService.extractRequestMetadata(request) : {}),
      metadata: {
        description: 'Admin removed user verification',
      },
    });

    this.logger.log(
      `User ${userId} unverified by admin ${adminUserId}`,
    );

    return updatedUser;
  }

  /**
   * Suspend a user
   * Sets status to suspended, records reason and optional expiry date
   */
  async suspendUser(
    userId: string,
    adminUserId: string,
    reason: string,
    suspendUntil?: Date,
    request?: Request,
  ): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    if (user.status === UserStatus.BANNED) {
      throw new BadRequestException(
        'Cannot suspend a banned user. Unban first if needed.',
      );
    }

    if (!reason || reason.trim().length === 0) {
      throw new BadRequestException('Suspend reason is required');
    }

    // Capture before state
    const before = {
      status: user.status,
      suspendReason: user.suspendReason,
      suspendUntil: user.suspendUntil,
      suspendedAt: user.suspendedAt,
      suspendedById: user.suspendedById,
    };

    // Update user
    user.status = UserStatus.SUSPENDED;
    user.suspendReason = reason.trim();
    user.suspendUntil = suspendUntil || null;
    user.suspendedAt = new Date();
    user.suspendedById = adminUserId;
    // Clear banned fields if previously banned
    user.bannedAt = undefined;
    user.bannedById = undefined;

    const updatedUser = await this.userRepository.save(user);

    // Capture after state
    const after = {
      status: updatedUser.status,
      suspendReason: updatedUser.suspendReason,
      suspendUntil: updatedUser.suspendUntil,
      suspendedAt: updatedUser.suspendedAt,
      suspendedById: updatedUser.suspendedById,
    };

    // Log to audit
    await this.auditLogService.create({
      actorUserId: adminUserId,
      action: 'user.suspended',
      entityType: 'user',
      entityId: userId,
      beforeJson: before,
      afterJson: after,
      ...(request ? this.auditLogService.extractRequestMetadata(request) : {}),
      metadata: {
        description: 'Admin suspended user account',
        reason,
        suspendUntil: suspendUntil?.toISOString(),
        isTemporary: !!suspendUntil,
      },
    });

    this.logger.log(
      `User ${userId} suspended by admin ${adminUserId}${suspendUntil ? ` until ${suspendUntil.toISOString()}` : ' indefinitely'}`,
    );

    return updatedUser;
  }

  /**
   * Unsuspend a user
   * Sets status back to active, clears suspension data
   */
  async unsuspendUser(
    userId: string,
    adminUserId: string,
    request?: Request,
  ): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    if (user.status !== UserStatus.SUSPENDED) {
      throw new BadRequestException(
        `User is not suspended (current status: ${user.status})`,
      );
    }

    // Capture before state
    const before = {
      status: user.status,
      suspendReason: user.suspendReason,
      suspendUntil: user.suspendUntil,
      suspendedAt: user.suspendedAt,
      suspendedById: user.suspendedById,
    };

    // Update user
    user.status = UserStatus.ACTIVE;
    user.suspendReason = undefined;
    user.suspendUntil = undefined;
    user.suspendedAt = undefined;
    user.suspendedById = undefined;

    const updatedUser = await this.userRepository.save(user);

    // Capture after state
    const after = {
      status: updatedUser.status,
      suspendReason: updatedUser.suspendReason,
      suspendUntil: updatedUser.suspendUntil,
      suspendedAt: updatedUser.suspendedAt,
      suspendedById: updatedUser.suspendedById,
    };

    // Log to audit
    await this.auditLogService.create({
      actorUserId: adminUserId,
      action: 'user.unsuspended',
      entityType: 'user',
      entityId: userId,
      beforeJson: before,
      afterJson: after,
      ...(request ? this.auditLogService.extractRequestMetadata(request) : {}),
      metadata: {
        description: 'Admin unsuspended user account',
      },
    });

    this.logger.log(
      `User ${userId} unsuspended by admin ${adminUserId}`,
    );

    return updatedUser;
  }

  /**
   * Ban a user permanently
   * Sets status to banned, records reason
   */
  async banUser(
    userId: string,
    adminUserId: string,
    reason: string,
    request?: Request,
  ): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    if (!reason || reason.trim().length === 0) {
      throw new BadRequestException('Ban reason is required');
    }

    // Capture before state
    const before = {
      status: user.status,
      suspendReason: user.suspendReason,
      suspendUntil: user.suspendUntil,
      suspendedAt: user.suspendedAt,
      suspendedById: user.suspendedById,
      bannedAt: user.bannedAt,
      bannedById: user.bannedById,
    };

    // Update user
    user.status = UserStatus.BANNED;
    user.suspendReason = reason.trim();
    user.suspendUntil = undefined; // No expiry for bans
    user.bannedAt = new Date();
    user.bannedById = adminUserId;
    // Clear suspended fields
    user.suspendedAt = undefined;
    user.suspendedById = undefined;

    const updatedUser = await this.userRepository.save(user);

    // Capture after state
    const after = {
      status: updatedUser.status,
      suspendReason: updatedUser.suspendReason,
      suspendUntil: updatedUser.suspendUntil,
      suspendedAt: updatedUser.suspendedAt,
      suspendedById: updatedUser.suspendedById,
      bannedAt: updatedUser.bannedAt,
      bannedById: updatedUser.bannedById,
    };

    // Log to audit
    await this.auditLogService.create({
      actorUserId: adminUserId,
      action: 'user.banned',
      entityType: 'user',
      entityId: userId,
      beforeJson: before,
      afterJson: after,
      ...(request ? this.auditLogService.extractRequestMetadata(request) : {}),
      metadata: {
        description: 'Admin banned user account permanently',
        reason,
      },
    });

    this.logger.log(
      `User ${userId} banned permanently by admin ${adminUserId}`,
    );

    return updatedUser;
  }

  /**
   * Check if user is currently suspended (considering expiry)
   */
  isUserSuspended(user: User): boolean {
    if (user.status !== UserStatus.SUSPENDED) {
      return false;
    }

    // If no expiry date, suspension is indefinite
    if (!user.suspendUntil) {
      return true;
    }

    // Check if suspension has expired
    return new Date() < user.suspendUntil;
  }

  /**
   * Check if user can perform actions (not suspended or banned)
   */
  canUserPerformActions(user: User): { allowed: boolean; reason?: string } {
    if (user.status === UserStatus.BANNED) {
      return {
        allowed: false,
        reason: `Account banned: ${user.suspendReason}`,
      };
    }

    if (this.isUserSuspended(user)) {
      const until = user.suspendUntil
        ? ` until ${user.suspendUntil.toISOString()}`
        : ' indefinitely';
      return {
        allowed: false,
        reason: `Account suspended${until}: ${user.suspendReason}`,
      };
    }

    return { allowed: true };
  }
}
