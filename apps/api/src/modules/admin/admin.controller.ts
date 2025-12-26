import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
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
import { AdminRateLimitGuard } from './guards/admin-rate-limit.guard';
import { AdminIpLockGuard } from './guards/admin-ip-lock.guard';
import { AdminFailureInterceptor } from './interceptors/admin-failure.interceptor';
import { SensitiveAction } from './decorators/sensitive-action.decorator';

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
  constructor(private readonly adminService: AdminService) {}

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
  async getStats(@Request() req) {
    return this.adminService.getStats(req.user);
  }

  /**
   * Get all users with details
   * Only accessible to admins
   */
  @Get('users')
  @ApiOperation({ summary: 'Get all users (admin only)' })
  @ApiResponse({
    status: 200,
    description: 'List of all users',
  })
  async getAllUsers() {
    return this.adminService.getAllUsers();
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
