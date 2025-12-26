import {
  Controller,
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
import { AuditLog } from '../audit-log/decorators/audit-log.decorator';
import { AuditLogInterceptor } from '../audit-log/interceptors/audit-log.interceptor';

/**
 * Admin Audit Examples Controller
 *
 * Demonstrates how to use the audit log system with @AuditLog() decorator
 * and AuditLogInterceptor
 */
@ApiTags('admin')
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@UseInterceptors(AuditLogInterceptor) // Apply audit logging to all routes
@ApiBearerAuth()
export class AdminAuditExamplesController {
  /**
   * Verify user account
   * Automatically logged with @AuditLog() decorator
   */
  @Patch('users/:userId/verify')
  @AuditLog({
    action: 'user.verified',
    entityType: 'user',
    entityIdParam: 'userId',
    includeResult: true,
  })
  @ApiOperation({ summary: 'Verify user account (admin only)' })
  @ApiResponse({
    status: 200,
    description: 'User verified successfully',
  })
  async verifyUser(@Param('userId') userId: string, @Request() req) {
    // Your business logic here
    // The @AuditLog() decorator will automatically log this action

    return {
      success: true,
      message: 'User verified',
      userId,
      verifiedBy: req.user.sub,
      verifiedAt: new Date(),
    };
  }

  /**
   * Suspend user account
   * Automatically logged with reason in metadata
   */
  @Patch('users/:userId/suspend')
  @AuditLog({
    action: 'user.suspended',
    entityType: 'user',
    entityIdParam: 'userId',
    includeParams: true,
    includeResult: true,
  })
  @ApiOperation({ summary: 'Suspend user account (admin only)' })
  @ApiResponse({
    status: 200,
    description: 'User suspended successfully',
  })
  async suspendUser(
    @Param('userId') userId: string,
    @Body() body: { reason: string },
    @Request() req,
  ) {
    // Your business logic here
    // The reason will be captured in beforeJson via includeParams

    return {
      success: true,
      message: 'User suspended',
      userId,
      reason: body.reason,
      suspendedBy: req.user.sub,
      suspendedAt: new Date(),
    };
  }

  /**
   * Delete review
   * Logged with review data and reason
   */
  @Delete('reviews/:reviewId')
  @AuditLog({
    action: 'review.deleted',
    entityType: 'review',
    entityIdParam: 'reviewId',
    includeParams: true,
  })
  @ApiOperation({ summary: 'Delete review (admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Review deleted successfully',
  })
  async deleteReview(
    @Param('reviewId') reviewId: string,
    @Body() body: { reason: string },
    @Request() req,
  ) {
    // Your business logic here
    // Review data and reason will be captured in audit log

    return {
      success: true,
      message: 'Review deleted',
      reviewId,
      deletedBy: req.user.sub,
      deletedAt: new Date(),
    };
  }

  /**
   * Cancel job
   * Logged with cancellation reason
   */
  @Patch('jobs/:jobId/cancel')
  @AuditLog({
    action: 'job.cancelled',
    entityType: 'job',
    entityIdParam: 'jobId',
    includeParams: true,
    includeResult: true,
  })
  @ApiOperation({ summary: 'Cancel job (admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Job cancelled successfully',
  })
  async cancelJob(
    @Param('jobId') jobId: string,
    @Body() body: { reason: string },
    @Request() req,
  ) {
    // Your business logic here
    // Job ID and reason will be captured

    return {
      success: true,
      message: 'Job cancelled',
      jobId,
      reason: body.reason,
      cancelledBy: req.user.sub,
      cancelledAt: new Date(),
    };
  }

  /**
   * Force confirm match
   * Useful for resolving disputes or manual confirmations
   */
  @Patch('matches/:matchId/force-confirm')
  @AuditLog({
    action: 'match.force_confirmed',
    entityType: 'match',
    entityIdParam: 'matchId',
    includeParams: true,
    includeResult: true,
  })
  @ApiOperation({ summary: 'Force confirm match (admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Match force confirmed successfully',
  })
  async forceConfirmMatch(
    @Param('matchId') matchId: string,
    @Body() body: { reason: string },
    @Request() req,
  ) {
    // Your business logic here
    // This will be logged as admin intervention

    return {
      success: true,
      message: 'Match force confirmed by admin',
      matchId,
      reason: body.reason,
      confirmedBy: req.user.sub,
      confirmedAt: new Date(),
    };
  }
}
