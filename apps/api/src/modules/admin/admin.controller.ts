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
import { AdminRateLimitGuard } from './guards/admin-rate-limit.guard';
import { AdminIpLockGuard } from './guards/admin-ip-lock.guard';
import { AdminFailureInterceptor } from './interceptors/admin-failure.interceptor';
import { SensitiveAction } from './decorators/sensitive-action.decorator';
import { GetUsersQueryDto } from './dto/get-users-query.dto';
import { PaginatedUsersResponseDto } from './dto/user-response.dto';
import { DetailedUserResponseDto } from './dto/detailed-user-response.dto';
import { SuspendUserDto, BanUserDto } from './dto/suspend-user.dto';
import { MergeUsersDto, MergeUsersResponseDto } from './dto/merge-users.dto';

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
}
