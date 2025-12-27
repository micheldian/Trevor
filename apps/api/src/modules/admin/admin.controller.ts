import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  UseInterceptors,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { AdminService } from './admin.service';
import { AdminUsersService } from './services/admin-users.service';
import { AdminReviewsService } from './services/admin-reviews.service';
import { AdminJobsService } from './services/admin-jobs.service';
import { AdminMatchesService } from './services/admin-matches.service';
import { AdminConflictsService } from './services/admin-conflicts.service';
import { AdminReportsService } from '../reports/services/admin-reports.service';
import { AdminTagsService } from '../tags/services/admin-tags.service';
import { AdminRateLimitGuard } from './guards/admin-rate-limit.guard';
import { AdminIpLockGuard } from './guards/admin-ip-lock.guard';
import { AdminFailureInterceptor } from './interceptors/admin-failure.interceptor';
import { SensitiveAction } from './decorators/sensitive-action.decorator';
import { GetUsersQueryDto } from './dto/get-users-query.dto';
import { PaginatedUsersResponseDto } from './dto/user-response.dto';
import { DetailedUserResponseDto } from './dto/detailed-user-response.dto';
import { SuspendUserDto, BanUserDto } from './dto/suspend-user.dto';
import { MergeUsersDto, MergeUsersResponseDto } from './dto/merge-users.dto';
import {
  GetAdminReviewsQueryDto,
  AdminReviewResponseDto,
  PaginatedAdminReviewsResponseDto,
  HideReviewDto,
  UpdateReviewContentDto,
} from './dto/admin-reviews.dto';
import { GetReportsQueryDto } from '../reports/dto/get-reports-query.dto';
import { UpdateReportStatusDto } from '../reports/dto/update-report-status.dto';
import {
  AdminReportResponseDto,
  PaginatedReportsResponseDto,
} from '../reports/dto/report-response.dto';
import { GetTagsQueryDto } from '../tags/dto/get-tags-query.dto';
import { CreateTagDto } from '../tags/dto/create-tag.dto';
import { UpdateTagDto } from '../tags/dto/update-tag.dto';
import { CreateTagAliasDto } from '../tags/dto/create-tag-alias.dto';
import {
  TagResponseDto,
  TagAliasResponseDto,
  PaginatedTagsResponseDto,
} from '../tags/dto/tag-response.dto';
import { GetJobsQueryDto } from './dto/get-jobs-query.dto';
import { GetJobsResponseDto } from './dto/admin-job-response.dto';
import {
  CancelJobDto,
  CompleteJobDto,
  ReopenJobDto,
  ChangeJobStatusDto,
  JobActionResponseDto,
} from './dto/job-actions.dto';
import { GetMatchesQueryDto } from './dto/get-matches-query.dto';
import { GetMatchesResponseDto } from './dto/admin-match-response.dto';
import {
  GetConflictsResponseDto,
  ResolveConflictDto,
  ResolveConflictResponseDto,
} from './dto/conflicts.dto';

/**
 * Admin Controller
 *
 * All routes in this controller are protected and require ADMIN role.
 * Demonstrates RBAC (Role-Based Access Control) implementation.
 *
 * Guards order matters:
 * 1. JwtAuthGuard - Validates JWT and adds user to request
 * 2. RolesGuard - Checks if user has required role
 * 3. AdminIpLockGuard - Prevents access from locked IPs
 * 4. AdminRateLimitGuard - Enforces rate limiting
 *
 * Sensitive actions are marked with @SensitiveAction() decorator.
 */
@ApiTags('admin')
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard, AdminIpLockGuard, AdminRateLimitGuard)
@UseInterceptors(AdminFailureInterceptor)
@Roles(Role.ADMIN) // All routes require ADMIN role
@ApiBearerAuth()
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly adminUsersService: AdminUsersService,
    private readonly adminReviewsService: AdminReviewsService,
    private readonly adminJobsService: AdminJobsService,
    private readonly adminMatchesService: AdminMatchesService,
    private readonly adminConflictsService: AdminConflictsService,
    private readonly adminReportsService: AdminReportsService,
    private readonly adminTagsService: AdminTagsService,
  ) {}

  /**
   * Get platform statistics
   * Only accessible to admins
   */
  @Get('stats')
  @ApiOperation({ summary: 'Get platform statistics (admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Platform statistics',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin role required',
  })
  async getStats(@Request() req: any) {
    return this.adminService.getStats(req.user);
  }

  /**
   * Get all users with details, pagination, and filters
   * Only accessible to admins
   */
  @Get('users')
  @ApiOperation({
    summary: 'Get paginated users with filters (admin only)',
    description: `
      Get users with pagination, filtering, and sorting.

      Filters:
      - role: Filter by user role (worker, team_lead, employer, admin)
      - status: Filter by account status (active, inactive, suspended)
      - verified: Filter by verification status (true/false)
      - q: Search by name, email, or phone
      - minRating: Filter by minimum average rating (0-5)
      - hasVehicle: Filter by vehicle ownership (true/false)
      - lastActiveRange: Filter by last activity (7, 30, or 90 days)

      Sorting:
      - sortBy: Sort field (createdAt, lastSeenAt, ratingAvg, missionsCount)
      - sortOrder: Sort order (ASC, DESC)

      Returns user data with statistics:
      - ratingAvg: Average rating from reviews
      - missionsCount: Number of completed missions
      - lastSeenAt: Last activity timestamp
    `,
  })
  @ApiResponse({
    status: 200,
    description: 'Paginated list of users with statistics',
    type: PaginatedUsersResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid query parameters',
  })
  async getUsers(@Query() query: GetUsersQueryDto) {
    return this.adminUsersService.getUsers(query);
  }

  /**
   * Get detailed user information by ID
   * Only accessible to admins
   */
  @Get('users/:userId')
  @ApiOperation({
    summary: 'Get detailed user by ID (admin only)',
    description: `
      Get comprehensive information about a specific user including:
      - Basic user information and profiles
      - Recent availabilities (last 30 days, up to 10)
      - Related jobs (if employer, up to 20)
      - Related matches (up to 30)
      - Reviews received (up to 50)
      - Audit logs (up to 50)
      - Detailed statistics (ratings, missions, matches by status)
    `,
  })
  @ApiResponse({
    status: 200,
    description: 'Detailed user information',
    type: DetailedUserResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  async getUserById(@Param('userId') userId: string) {
    return this.adminUsersService.getUserById(userId);
  }

  /**
   * Verify a user
   * Only accessible to admins
   */
  @Post('users/:userId/verify')
  @SensitiveAction() // Sensitive: User verification affects trust
  @ApiOperation({
    summary: 'Verify user (admin only)',
    description: `
      Verify a user account. This action:
      - Sets isVerified to true
      - Records verification timestamp
      - Records the admin who verified the user
      - Creates an audit log entry
    `,
  })
  @ApiResponse({
    status: 200,
    description: 'User verified successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  async verifyUser(
    @Param('userId') userId: string,
    @Request() req: any,
  ) {
    const adminUserId = req.user?.userId;
    return this.adminUsersService.verifyUser(userId, adminUserId, req);
  }

  /**
   * Unverify a user
   * Only accessible to admins
   */
  @Post('users/:userId/unverify')
  @SensitiveAction() // Sensitive: Removing verification affects trust
  @ApiOperation({
    summary: 'Unverify user (admin only)',
    description: `
      Remove verification from a user account. This action:
      - Sets isVerified to false
      - Clears verification timestamp
      - Clears the admin who verified the user
      - Creates an audit log entry
    `,
  })
  @ApiResponse({
    status: 200,
    description: 'User unverified successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  async unverifyUser(
    @Param('userId') userId: string,
    @Request() req: any,
  ) {
    const adminUserId = req.user?.userId;
    return this.adminUsersService.unverifyUser(userId, adminUserId, req);
  }

  /**
   * Suspend a user
   * Only accessible to admins
   */
  @Post('users/:userId/suspend')
  @SensitiveAction() // Sensitive: Account suspension blocks user access
  @ApiOperation({
    summary: 'Suspend user (admin only)',
    description: `
      Suspend a user account temporarily or indefinitely. This action:
      - Sets status to SUSPENDED
      - Blocks user from logging in
      - Blocks user from performing any actions
      - Records suspension reason and optional expiry date
      - Records the admin who suspended the user
      - Creates an audit log entry

      Suspension can be:
      - Temporary: Provide suspendUntil date
      - Indefinite: Omit suspendUntil
    `,
  })
  @ApiResponse({
    status: 200,
    description: 'User suspended successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - missing reason or trying to suspend banned user',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  async suspendUser(
    @Param('userId') userId: string,
    @Body() dto: SuspendUserDto,
    @Request() req: any,
  ) {
    const adminUserId = req.user?.userId;
    const suspendUntil = dto.suspendUntil ? new Date(dto.suspendUntil) : undefined;
    return this.adminUsersService.suspendUser(
      userId,
      adminUserId,
      dto.reason,
      suspendUntil,
      req,
    );
  }

  /**
   * Unsuspend a user
   * Only accessible to admins
   */
  @Post('users/:userId/unsuspend')
  @SensitiveAction() // Sensitive: Restoring user access
  @ApiOperation({
    summary: 'Unsuspend user (admin only)',
    description: `
      Remove suspension from a user account. This action:
      - Sets status back to ACTIVE
      - Restores user login and action permissions
      - Clears suspension reason and expiry date
      - Creates an audit log entry
    `,
  })
  @ApiResponse({
    status: 200,
    description: 'User unsuspended successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - user is not suspended',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  async unsuspendUser(
    @Param('userId') userId: string,
    @Request() req: any,
  ) {
    const adminUserId = req.user?.userId;
    return this.adminUsersService.unsuspendUser(userId, adminUserId, req);
  }

  /**
   * Ban a user permanently
   * Only accessible to admins
   */
  @Post('users/:userId/ban')
  @SensitiveAction() // Sensitive: Permanent account ban
  @ApiOperation({
    summary: 'Ban user permanently (admin only)',
    description: `
      Ban a user account permanently. This action:
      - Sets status to BANNED
      - Permanently blocks user from logging in
      - Permanently blocks user from performing any actions
      - Records ban reason and timestamp
      - Records the admin who banned the user
      - Creates an audit log entry

      Note: Bans are permanent and cannot be automatically lifted.
      Use unsuspend endpoint to restore access if needed.
    `,
  })
  @ApiResponse({
    status: 200,
    description: 'User banned successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - missing reason',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  async banUser(
    @Param('userId') userId: string,
    @Body() dto: BanUserDto,
    @Request() req: any,
  ) {
    const adminUserId = req.user?.userId;
    return this.adminUsersService.banUser(userId, adminUserId, dto.reason, req);
  }

  /**
   * Merge two user accounts
   * Only accessible to admins
   */
  @Post('users/merge')
  @SensitiveAction() // Sensitive: Permanent data transfer and user deactivation
  @ApiOperation({
    summary: 'Merge two user accounts (admin only)',
    description: `
      Merge two user accounts by transferring all data from source to target user.

      **WHAT GETS TRANSFERRED:**
      - All profiles (user_id updated)
      - All reviews given (reviewer_id updated)
      - All reviews received (reviewee_id updated)
      - All jobs posted (employer_id updated)
      - All matches (via profiles - automatically transferred)
      - All availabilities (via profiles - automatically transferred)

      **WHAT HAPPENS TO SOURCE USER:**
      - Set to inactive (is_active = false)
      - Status set to SUSPENDED
      - Suspend reason set to "Merged into user {targetId}"

      **SAFETY CHECKS:**
      - Both users must exist
      - Cannot merge user with itself
      - Target must be active
      - Source cannot be admin (security)
      - All operations in atomic transaction

      **DRY RUN MODE:**
      - Set dryRun: true to preview changes without executing
      - Returns what would be transferred

      **AUDIT LOGGING:**
      - Complete before/after state captured
      - Transfer summary recorded
      - Action: "users.merged"
    `,
  })
  @ApiResponse({
    status: 200,
    description: 'Users merged successfully',
    type: MergeUsersResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - validation failed',
  })
  @ApiResponse({
    status: 404,
    description: 'Source or target user not found',
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict - transaction failed',
  })
  async mergeUsers(
    @Body() dto: MergeUsersDto,
    @Request() req: any,
  ): Promise<MergeUsersResponseDto> {
    const adminUserId = req.user?.userId;
    return this.adminUsersService.mergeUsers(dto, adminUserId, req);
  }

  /**
   * Update user role
   * Only accessible to admins
   */
  @Patch('users/:userId/role')
  @SensitiveAction() // Sensitive: Role changes affect permissions
  @ApiOperation({ summary: 'Update user role (admin only)' })
  @ApiResponse({
    status: 200,
    description: 'User role updated successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  async updateUserRole(
    @Param('userId') userId: string,
    @Body() body: { role: Role },
  ) {
    return this.adminService.updateUserRole(userId, body.role);
  }

  /**
   * Deactivate user
   * Only accessible to admins
   */
  @Delete('users/:userId')
  @SensitiveAction() // Sensitive: User deletion
  @ApiOperation({ summary: 'Deactivate user (admin only)' })
  @ApiResponse({
    status: 200,
    description: 'User deactivated successfully',
  })
  async deactivateUser(@Param('userId') userId: string) {
    return this.adminService.deactivateUser(userId);
  }

  /**
   * Get all jobs (including drafts and cancelled)
   * Only accessible to admins
   */
  @Get('jobs')
  @ApiOperation({ summary: 'Get all jobs (admin only)' })
  @ApiResponse({
    status: 200,
    description: 'List of all jobs',
  })
  async getAllJobs() {
    return this.adminService.getAllJobs();
  }

  /**
   * Get all matches
   * Only accessible to admins
   */
  @Get('matches')
  @ApiOperation({ summary: 'Get all matches (admin only)' })
  @ApiResponse({
    status: 200,
    description: 'List of all matches',
  })
  async getAllMatches() {
    return this.adminService.getAllMatches();
  }

  /**
   * Get platform metrics
   * Only accessible to admins
   */
  @Get('metrics')
  @ApiOperation({ summary: 'Get platform metrics (admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Platform metrics',
  })
  async getMetrics() {
    return this.adminService.getMetrics();
  }

  /**
   * Get all locked IPs
   * Only accessible to admins
   */
  @Get('security/locked-ips')
  @ApiOperation({ summary: 'Get all locked IP addresses (admin only)' })
  @ApiResponse({
    status: 200,
    description: 'List of locked IPs',
  })
  async getLockedIps() {
    return this.adminService.getLockedIps();
  }

  /**
   * Get IP statistics
   * Only accessible to admins
   */
  @Get('security/ips/:ip/stats')
  @ApiOperation({ summary: 'Get IP address statistics (admin only)' })
  @ApiResponse({
    status: 200,
    description: 'IP statistics',
  })
  async getIpStats(@Param('ip') ip: string) {
    return this.adminService.getIpStats(ip);
  }

  /**
   * Unlock IP address
   * Only accessible to admins
   */
  @Post('security/ips/:ip/unlock')
  @SensitiveAction() // Sensitive: Unlocking IPs bypasses security
  @ApiOperation({ summary: 'Unlock IP address (admin only)' })
  @ApiResponse({
    status: 200,
    description: 'IP unlocked successfully',
  })
  async unlockIp(@Param('ip') ip: string) {
    return this.adminService.unlockIp(ip);
  }

  /**
   * Get all reviews with filters for moderation
   * Only accessible to admins
   */
  @Get('reviews')
  @ApiOperation({
    summary: 'Get paginated reviews with filters (admin only)',
    description: `
      Get reviews with pagination, filtering, and sorting for moderation purposes.

      Filters:
      - maxRating: Filter by maximum rating (e.g., 2 for poor reviews)
      - minRating: Filter by minimum rating (e.g., 4 for good reviews)
      - flagged: Filter flagged reviews only (true/false)
      - hidden: Filter hidden reviews only (true/false)
      - includeDeleted: Include soft-deleted reviews (true/false)
      - reviewerId: Filter by reviewer user ID
      - reviewedId: Filter by reviewed user ID
      - search: Search in comment text (case-insensitive)

      Sorting:
      - sortBy: Sort field (createdAt, rating, flaggedAt)
      - sortOrder: Sort order (ASC, DESC)

      Returns review data with moderation information:
      - Reviewer and reviewed user details
      - Hidden/flagged status and reasons
      - Moderation history (who, when)
      - Soft delete status
    `,
  })
  @ApiResponse({
    status: 200,
    description: 'Paginated list of reviews with moderation data',
    type: PaginatedAdminReviewsResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid query parameters',
  })
  async getReviews(
    @Query() query: GetAdminReviewsQueryDto,
  ): Promise<PaginatedAdminReviewsResponseDto> {
    return this.adminReviewsService.getReviews(query);
  }

  /**
   * Get single review by ID with full moderation details
   * Only accessible to admins
   */
  @Get('reviews/:reviewId')
  @ApiOperation({
    summary: 'Get review by ID with moderation details (admin only)',
    description: `
      Get comprehensive information about a specific review including:
      - Full review content and rating
      - Reviewer and reviewed user information
      - Hidden status and reason
      - Flagged status and reason
      - Soft delete status
      - Complete moderation history
    `,
  })
  @ApiResponse({
    status: 200,
    description: 'Detailed review information',
    type: AdminReviewResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Review not found',
  })
  async getReview(
    @Param('reviewId') reviewId: string,
  ): Promise<AdminReviewResponseDto> {
    return this.adminReviewsService.getReview(reviewId);
  }

  /**
   * Hide a review from public display
   * Only accessible to admins
   */
  @Post('reviews/:reviewId/hide')
  @SensitiveAction() // Sensitive: Hiding reviews affects public visibility
  @ApiOperation({
    summary: 'Hide review (admin only)',
    description: `
      Hide a review from public display. This action:
      - Sets isHidden to true
      - Records the reason for hiding
      - Records timestamp and admin who hid it
      - Creates an audit log entry

      Hidden reviews are still accessible to admins but not visible to regular users.
    `,
  })
  @ApiResponse({
    status: 200,
    description: 'Review hidden successfully',
    type: AdminReviewResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - review is already hidden',
  })
  @ApiResponse({
    status: 404,
    description: 'Review not found',
  })
  async hideReview(
    @Param('reviewId') reviewId: string,
    @Body() dto: HideReviewDto,
    @Request() req: any,
  ): Promise<AdminReviewResponseDto> {
    const adminUserId = req.user?.userId;
    return this.adminReviewsService.hideReview(reviewId, dto, adminUserId, req);
  }

  /**
   * Unhide a review (restore to public visibility)
   * Only accessible to admins
   */
  @Post('reviews/:reviewId/unhide')
  @SensitiveAction() // Sensitive: Restoring review visibility
  @ApiOperation({
    summary: 'Unhide review (admin only)',
    description: `
      Restore a hidden review to public visibility. This action:
      - Sets isHidden to false
      - Clears hidden reason and timestamp
      - Records the admin who unhid it
      - Creates an audit log entry
    `,
  })
  @ApiResponse({
    status: 200,
    description: 'Review unhidden successfully',
    type: AdminReviewResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - review is not hidden',
  })
  @ApiResponse({
    status: 404,
    description: 'Review not found',
  })
  async unhideReview(
    @Param('reviewId') reviewId: string,
    @Request() req: any,
  ): Promise<AdminReviewResponseDto> {
    const adminUserId = req.user?.userId;
    return this.adminReviewsService.unhideReview(reviewId, adminUserId, req);
  }

  /**
   * Soft delete a review
   * Only accessible to admins
   */
  @Delete('reviews/:reviewId')
  @SensitiveAction() // Sensitive: Review deletion
  @ApiOperation({
    summary: 'Soft delete review (admin only)',
    description: `
      Soft delete a review. This action:
      - Sets deleted_at timestamp
      - Marks review as inactive
      - Records the admin who deleted it
      - Creates an audit log entry

      Soft-deleted reviews are excluded from public queries but can be restored.
      Use includeDeleted=true in GET /admin/reviews to see deleted reviews.
    `,
  })
  @ApiResponse({
    status: 204,
    description: 'Review deleted successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - review is already deleted',
  })
  @ApiResponse({
    status: 404,
    description: 'Review not found',
  })
  async deleteReview(
    @Param('reviewId') reviewId: string,
    @Request() req: any,
  ): Promise<void> {
    const adminUserId = req.user?.userId;
    return this.adminReviewsService.deleteReview(reviewId, adminUserId, req);
  }

  /**
   * Update review content (optional admin edit)
   * Only accessible to admins
   */
  @Patch('reviews/:reviewId')
  @SensitiveAction() // Sensitive: Editing user-generated content
  @ApiOperation({
    summary: 'Update review content (admin only)',
    description: `
      Update review comment and/or rating. This action:
      - Updates the comment text (if provided)
      - Updates the rating (if provided)
      - Records the admin who edited it
      - Records moderation timestamp
      - Creates an audit log entry with before/after state

      This is an optional feature for content moderation when hiding is not appropriate.
    `,
  })
  @ApiResponse({
    status: 200,
    description: 'Review updated successfully',
    type: AdminReviewResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Review not found',
  })
  async updateReview(
    @Param('reviewId') reviewId: string,
    @Body() dto: UpdateReviewContentDto,
    @Request() req: any,
  ): Promise<AdminReviewResponseDto> {
    const adminUserId = req.user?.userId;
    return this.adminReviewsService.updateReview(reviewId, dto, adminUserId, req);
  }

  /**
   * Get all reports with filters
   * Only accessible to admins
   */
  @Get('reports')
  @ApiOperation({
    summary: 'Get all reports with filters (admin only)',
    description: `
      Get all user reports with pagination and filtering.

      Filters:
      - status: Filter by report status (open, in_review, closed, dismissed)
      - targetType: Filter by target entity type (user, review, job, profile)
      - reason: Filter by report reason (spam, inappropriate, harassment, fake, scam, other)
      - reporterId: Filter by reporter user ID
      - targetId: Filter by target entity ID

      Sorting:
      - sortBy: Sort field (createdAt, updatedAt, resolvedAt)
      - sortOrder: Sort order (ASC, DESC)

      Returns report data with:
      - Reporter information
      - Target details
      - Resolution status and notes
      - Admin who resolved (if applicable)
    `,
  })
  @ApiResponse({
    status: 200,
    description: 'Paginated list of reports',
    type: PaginatedReportsResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid query parameters',
  })
  async getReports(
    @Query() query: GetReportsQueryDto,
  ): Promise<PaginatedReportsResponseDto> {
    return this.adminReportsService.getReports(query);
  }

  /**
   * Get single report by ID
   * Only accessible to admins
   */
  @Get('reports/:reportId')
  @ApiOperation({
    summary: 'Get report by ID (admin only)',
    description: 'Get detailed information about a specific report',
  })
  @ApiResponse({
    status: 200,
    description: 'Report details',
    type: AdminReportResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Report not found',
  })
  async getReport(
    @Param('reportId') reportId: string,
  ): Promise<AdminReportResponseDto> {
    return this.adminReportsService.getReport(reportId);
  }

  /**
   * Update report status
   * Only accessible to admins
   */
  @Patch('reports/:reportId/status')
  @SensitiveAction() // Sensitive: Moderation action
  @ApiOperation({
    summary: 'Update report status (admin only)',
    description: `
      Update the status of a report. This action:
      - Changes the report status (open, in_review, closed, dismissed)
      - Records resolution note (optional)
      - Records the admin who resolved it
      - Records resolution timestamp
      - Creates an audit log entry

      When closing or dismissing, resolution tracking is automatically set.
      When reopening, resolution tracking is cleared.
    `,
  })
  @ApiResponse({
    status: 200,
    description: 'Report status updated successfully',
    type: AdminReportResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Report is already in this status',
  })
  @ApiResponse({
    status: 404,
    description: 'Report not found',
  })
  async updateReportStatus(
    @Param('reportId') reportId: string,
    @Body() dto: UpdateReportStatusDto,
    @Request() req: any,
  ): Promise<AdminReportResponseDto> {
    const adminUserId = req.user?.userId;
    return this.adminReportsService.updateReportStatus(reportId, dto, adminUserId, req);
  }

  /**
   * Delete a report
   * Only accessible to admins
   */
  @Delete('reports/:reportId')
  @SensitiveAction() // Sensitive: Report deletion
  @ApiOperation({
    summary: 'Delete report (admin only)',
    description: `
      Permanently delete a report. This action:
      - Hard deletes the report (cannot be undone)
      - Creates an audit log entry

      Use this for spam reports or reports created in error.
      For legitimate reports, prefer updating status to 'dismissed'.
    `,
  })
  @ApiResponse({
    status: 204,
    description: 'Report deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Report not found',
  })
  async deleteReport(
    @Param('reportId') reportId: string,
    @Request() req: any,
  ): Promise<void> {
    const adminUserId = req.user?.userId;
    return this.adminReportsService.deleteReport(reportId, adminUserId, req);
  }

  /**
   * Get reports statistics
   * Only accessible to admins
   */
  @Get('reports-stats')
  @ApiOperation({
    summary: 'Get reports statistics (admin only)',
    description: 'Get aggregated statistics about reports',
  })
  @ApiResponse({
    status: 200,
    description: 'Reports statistics',
  })
  async getReportsStatistics() {
    return this.adminReportsService.getStatistics();
  }

  /**
   * Get all tags with filters
   * Only accessible to admins
   */
  @Get('tags')
  @ApiOperation({
    summary: 'Get all tags with filters (admin only)',
    description: `
      Get all tags with pagination and filtering.

      Filters:
      - category: Filter by tag category (culture, skill, certification, equipment, other)
      - isActive: Filter by active status (true/false)
      - search: Search in tag name and description
      - includeAliases: Include aliases in response

      Sorting:
      - sortBy: Sort field (name, usageCount, createdAt)
      - sortOrder: Sort order (ASC, DESC)

      Returns tag data with:
      - Canonical tag names
      - Category and description
      - Usage statistics
      - Active status
      - Aliases (if requested)
    `,
  })
  @ApiResponse({
    status: 200,
    description: 'Paginated list of tags',
    type: PaginatedTagsResponseDto,
  })
  async getTags(@Query() query: GetTagsQueryDto): Promise<PaginatedTagsResponseDto> {
    return this.adminTagsService.getTags(query);
  }

  /**
   * Get single tag by ID
   * Only accessible to admins
   */
  @Get('tags/:tagId')
  @ApiOperation({
    summary: 'Get tag by ID (admin only)',
    description: 'Get detailed information about a specific tag including its aliases',
  })
  @ApiResponse({
    status: 200,
    description: 'Tag details',
    type: TagResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Tag not found',
  })
  async getTag(@Param('tagId') tagId: string): Promise<TagResponseDto> {
    return this.adminTagsService.getTag(tagId);
  }

  /**
   * Create a new tag
   * Only accessible to admins
   */
  @Post('tags')
  @SensitiveAction() // Sensitive: Content management
  @ApiOperation({
    summary: 'Create new tag (admin only)',
    description: `
      Create a new canonical tag. This action:
      - Creates a tag with auto-generated slug
      - Sets initial active status to true
      - Creates an audit log entry

      Tag names are automatically normalized (lowercase, trimmed).
    `,
  })
  @ApiResponse({
    status: 201,
    description: 'Tag created successfully',
    type: TagResponseDto,
  })
  @ApiResponse({
    status: 409,
    description: 'Tag with this name already exists',
  })
  async createTag(
    @Body() dto: CreateTagDto,
    @Request() req: any,
  ): Promise<TagResponseDto> {
    const adminUserId = req.user?.userId;
    return this.adminTagsService.createTag(dto, adminUserId, req);
  }

  /**
   * Update a tag
   * Only accessible to admins
   */
  @Patch('tags/:tagId')
  @SensitiveAction() // Sensitive: Content management
  @ApiOperation({
    summary: 'Update tag (admin only)',
    description: `
      Update an existing tag. This action:
      - Updates tag properties
      - Auto-regenerates slug if name is changed
      - Creates an audit log entry
    `,
  })
  @ApiResponse({
    status: 200,
    description: 'Tag updated successfully',
    type: TagResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Tag not found',
  })
  @ApiResponse({
    status: 409,
    description: 'Tag with this name already exists',
  })
  async updateTag(
    @Param('tagId') tagId: string,
    @Body() dto: UpdateTagDto,
    @Request() req: any,
  ): Promise<TagResponseDto> {
    const adminUserId = req.user?.userId;
    return this.adminTagsService.updateTag(tagId, dto, adminUserId, req);
  }

  /**
   * Delete a tag
   * Only accessible to admins
   */
  @Delete('tags/:tagId')
  @SensitiveAction() // Sensitive: Content deletion
  @ApiOperation({
    summary: 'Delete tag (admin only)',
    description: `
      Permanently delete a tag. This action:
      - Hard deletes the tag and all its aliases (CASCADE)
      - Only allowed if usageCount is 0
      - Creates an audit log entry

      If tag is being used, deactivate it instead using PATCH /tags/:id.
    `,
  })
  @ApiResponse({
    status: 204,
    description: 'Tag deleted successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Tag is being used and cannot be deleted',
  })
  @ApiResponse({
    status: 404,
    description: 'Tag not found',
  })
  async deleteTag(
    @Param('tagId') tagId: string,
    @Request() req: any,
  ): Promise<void> {
    const adminUserId = req.user?.userId;
    return this.adminTagsService.deleteTag(tagId, adminUserId, req);
  }

  /**
   * Create a tag alias
   * Only accessible to admins
   */
  @Post('tags/aliases')
  @SensitiveAction() // Sensitive: Content management
  @ApiOperation({
    summary: 'Create tag alias (admin only)',
    description: `
      Create a tag alias (variation). This action:
      - Links a variation (e.g., "pommes") to a canonical tag (e.g., "pomme")
      - Validates that alias doesn't conflict with existing tags or aliases
      - Creates an audit log entry

      Aliases are used to normalize search queries and improve matching.
    `,
  })
  @ApiResponse({
    status: 201,
    description: 'Tag alias created successfully',
    type: TagAliasResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Tag not found',
  })
  @ApiResponse({
    status: 409,
    description: 'Alias already exists or conflicts with tag name',
  })
  async createTagAlias(
    @Body() dto: CreateTagAliasDto,
    @Request() req: any,
  ): Promise<TagAliasResponseDto> {
    const adminUserId = req.user?.userId;
    return this.adminTagsService.createTagAlias(dto, adminUserId, req);
  }

  /**
   * Toggle tag alias active status
   * Only accessible to admins
   */
  @Patch('tags/aliases/:aliasId/toggle')
  @SensitiveAction() // Sensitive: Content management
  @ApiOperation({
    summary: 'Toggle tag alias status (admin only)',
    description: `
      Toggle the active status of a tag alias. This action:
      - Switches isActive between true and false
      - Creates an audit log entry

      Inactive aliases are not used in search normalization.
    `,
  })
  @ApiResponse({
    status: 200,
    description: 'Alias status toggled successfully',
    type: TagAliasResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Tag alias not found',
  })
  async toggleAliasStatus(
    @Param('aliasId') aliasId: string,
    @Request() req: any,
  ): Promise<TagAliasResponseDto> {
    const adminUserId = req.user?.userId;
    return this.adminTagsService.toggleAliasStatus(aliasId, adminUserId, req);
  }

  /**
   * Delete a tag alias
   * Only accessible to admins
   */
  @Delete('tags/aliases/:aliasId')
  @SensitiveAction() // Sensitive: Content deletion
  @ApiOperation({
    summary: 'Delete tag alias (admin only)',
    description: `
      Permanently delete a tag alias. This action:
      - Hard deletes the alias
      - Creates an audit log entry
    `,
  })
  @ApiResponse({
    status: 204,
    description: 'Tag alias deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Tag alias not found',
  })
  async deleteTagAlias(
    @Param('aliasId') aliasId: string,
    @Request() req: any,
  ): Promise<void> {
    const adminUserId = req.user?.userId;
    return this.adminTagsService.deleteTagAlias(aliasId, adminUserId, req);
  }

  /**
   * Get tags statistics
   * Only accessible to admins
   */
  @Get('tags-stats')
  @ApiOperation({
    summary: 'Get tags statistics (admin only)',
    description: 'Get aggregated statistics about tags and aliases',
  })
  @ApiResponse({
    status: 200,
    description: 'Tags statistics',
  })
  async getTagsStatistics() {
    return this.adminTagsService.getStatistics();
  }

  // ==================== JOBS MANAGEMENT ====================

  /**
   * Get jobs with comprehensive filters
   * Allows admins to view and manage all jobs in the platform
   */
  @Get('jobs')
  @SensitiveAction()
  @ApiOperation({
    summary: 'Get jobs with filters (admin only)',
    description:
      'Get paginated list of jobs with filters for status, employer, culture/tag, date ranges, and location distance',
  })
  @ApiResponse({
    status: 200,
    description: 'Paginated jobs list',
    type: GetJobsResponseDto,
  })
  async getJobs(
    @Query() query: GetJobsQueryDto,
    @Request() req: any,
  ): Promise<GetJobsResponseDto> {
    const adminUserId = req.user?.userId;
    return this.adminJobsService.getJobs(query, adminUserId, req);
  }

  /**
   * Cancel a job
   * Rule: Cannot cancel COMPLETED jobs (need to reopen first)
   */
  @Post('jobs/:id/cancel')
  @SensitiveAction()
  @ApiOperation({
    summary: 'Cancel a job (admin only)',
    description:
      'Cancel a job with a required reason. Cannot cancel COMPLETED jobs.',
  })
  @ApiResponse({
    status: 200,
    description: 'Job cancelled successfully',
    type: JobActionResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid request or job already in incompatible state',
  })
  @ApiResponse({
    status: 404,
    description: 'Job not found',
  })
  async cancelJob(
    @Param('id') jobId: string,
    @Body() dto: CancelJobDto,
    @Request() req: any,
  ): Promise<JobActionResponseDto> {
    const adminUserId = req.user?.userId;
    return this.adminJobsService.cancelJob(jobId, dto, adminUserId, req);
  }

  /**
   * Force complete a job
   * Rule: Normally requires CONFIRMED status, but can override
   */
  @Post('jobs/:id/complete')
  @SensitiveAction()
  @ApiOperation({
    summary: 'Complete a job (admin only)',
    description:
      'Mark a job as completed. Normally requires CONFIRMED status, but can be overridden.',
  })
  @ApiResponse({
    status: 200,
    description: 'Job completed successfully',
    type: JobActionResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid request or job not in valid state for completion',
  })
  @ApiResponse({
    status: 404,
    description: 'Job not found',
  })
  async completeJob(
    @Param('id') jobId: string,
    @Body() dto: CompleteJobDto,
    @Request() req: any,
  ): Promise<JobActionResponseDto> {
    const adminUserId = req.user?.userId;
    return this.adminJobsService.completeJob(jobId, dto, adminUserId, req);
  }

  /**
   * Reopen a job
   * Rule: Can reopen CANCELLED or COMPLETED jobs
   */
  @Post('jobs/:id/reopen')
  @SensitiveAction()
  @ApiOperation({
    summary: 'Reopen a job (admin only)',
    description:
      'Reopen a CANCELLED or COMPLETED job to a target status (typically PUBLISHED).',
  })
  @ApiResponse({
    status: 200,
    description: 'Job reopened successfully',
    type: JobActionResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid request or job not in CANCELLED/COMPLETED state',
  })
  @ApiResponse({
    status: 404,
    description: 'Job not found',
  })
  async reopenJob(
    @Param('id') jobId: string,
    @Body() dto: ReopenJobDto,
    @Request() req: any,
  ): Promise<JobActionResponseDto> {
    const adminUserId = req.user?.userId;
    return this.adminJobsService.reopenJob(jobId, dto, adminUserId, req);
  }

  /**
   * Change job status
   * Rule: Validates logical transitions unless override is used
   */
  @Post('jobs/:id/status')
  @SensitiveAction()
  @ApiOperation({
    summary: 'Change job status (admin only)',
    description:
      'Change job status with validation of logical transitions. Can override with flag.',
  })
  @ApiResponse({
    status: 200,
    description: 'Job status changed successfully',
    type: JobActionResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid status transition',
  })
  @ApiResponse({
    status: 404,
    description: 'Job not found',
  })
  async changeJobStatus(
    @Param('id') jobId: string,
    @Body() dto: ChangeJobStatusDto,
    @Request() req: any,
  ): Promise<JobActionResponseDto> {
    const adminUserId = req.user?.userId;
    return this.adminJobsService.changeJobStatus(jobId, dto, adminUserId, req);
  }

  // ==================== MATCHES MANAGEMENT ====================

  /**
   * Get matches with risk scoring
   * Calculates risk_score based on duplication, no response, and multi-confirm detection
   */
  @Get('matches')
  @SensitiveAction()
  @ApiOperation({
    summary: 'Get matches with risk scoring (admin only)',
    description:
      'Get paginated list of matches with filters and calculated risk scores. ' +
      'Risk score detects: duplicate matches, multiple confirmations, no response, and stale matches.',
  })
  @ApiResponse({
    status: 200,
    description: 'Paginated matches list with risk scores',
    type: GetMatchesResponseDto,
  })
  async getMatches(
    @Query() query: GetMatchesQueryDto,
    @Request() req: any,
  ): Promise<GetMatchesResponseDto> {
    const adminUserId = req.user?.userId;
    return this.adminMatchesService.getMatches(query, adminUserId, req);
  }

  // ==================== CONFLICTS DETECTION ====================

  /**
   * Get scheduling conflicts
   * Detects when candidates are confirmed on multiple jobs with overlapping time slots
   */
  @Get('conflicts')
  @SensitiveAction()
  @ApiOperation({
    summary: 'Detect scheduling conflicts (admin only)',
    description:
      'Detects when a candidate is confirmed on multiple jobs with overlapping schedules. ' +
      'Returns conflicts categorized by severity (critical, high, medium).',
  })
  @ApiResponse({
    status: 200,
    description: 'List of scheduling conflicts',
    type: GetConflictsResponseDto,
  })
  async getConflicts(@Request() req: any): Promise<GetConflictsResponseDto> {
    const adminUserId = req.user?.userId;
    return this.adminConflictsService.getConflicts(adminUserId, req);
  }

  /**
   * Resolve a scheduling conflict
   * Cancels one of the conflicting matches to resolve the conflict
   */
  @Post('conflicts/:conflictId/resolve')
  @SensitiveAction()
  @ApiOperation({
    summary: 'Resolve a scheduling conflict (admin only)',
    description:
      'Resolves a scheduling conflict by cancelling one of the conflicting matches. ' +
      'Optionally notifies the employer and candidate about the cancellation.',
  })
  @ApiResponse({
    status: 200,
    description: 'Conflict resolved successfully',
    type: ResolveConflictResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Match not found',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid request or match not in CONFIRMED status',
  })
  async resolveConflict(
    @Param('conflictId') conflictId: string,
    @Body() dto: ResolveConflictDto,
    @Request() req: any,
  ): Promise<ResolveConflictResponseDto> {
    const adminUserId = req.user?.userId;
    return this.adminConflictsService.resolveConflict(conflictId, dto, adminUserId, req);
  }
}
