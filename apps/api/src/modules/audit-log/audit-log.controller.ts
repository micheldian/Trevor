import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { AuditLogService } from './audit-log.service';
import { AuditLog } from './entities/audit-log.entity';

/**
 * Audit Log Controller
 *
 * Provides endpoints to view audit logs (admin only)
 */
@ApiTags('audit-logs')
@Controller('audit-logs')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN) // Only admins can view audit logs
@ApiBearerAuth()
export class AuditLogController {
  constructor(private readonly auditLogService: AuditLogService) {}

  /**
   * Get recent audit logs
   */
  @Get()
  @ApiOperation({ summary: 'Get recent audit logs (admin only)' })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of logs to return (default: 50)',
  })
  @ApiResponse({
    status: 200,
    description: 'List of recent audit logs',
    type: [AuditLog],
  })
  async getRecentLogs(@Query('limit') limit?: number): Promise<AuditLog[]> {
    return this.auditLogService.findRecent(limit ? parseInt(limit.toString()) : 50);
  }

  /**
   * Get audit logs for a specific entity
   */
  @Get('entity/:entityType/:entityId')
  @ApiOperation({ summary: 'Get audit logs for a specific entity (admin only)' })
  @ApiParam({
    name: 'entityType',
    description: 'Entity type (e.g., user, job, match)',
  })
  @ApiParam({
    name: 'entityId',
    description: 'Entity ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Audit logs for the specified entity',
    type: [AuditLog],
  })
  async getEntityLogs(
    @Param('entityType') entityType: string,
    @Param('entityId') entityId: string,
  ): Promise<AuditLog[]> {
    return this.auditLogService.findByEntity(entityType, entityId);
  }

  /**
   * Get audit logs by action type
   */
  @Get('action/:action')
  @ApiOperation({ summary: 'Get audit logs by action type (admin only)' })
  @ApiParam({
    name: 'action',
    description: 'Action type (e.g., user.verified, job.cancelled)',
  })
  @ApiResponse({
    status: 200,
    description: 'Audit logs for the specified action',
    type: [AuditLog],
  })
  async getActionLogs(@Param('action') action: string): Promise<AuditLog[]> {
    return this.auditLogService.findByAction(action);
  }

  /**
   * Get audit logs by actor (user who performed actions)
   */
  @Get('actor/:actorUserId')
  @ApiOperation({ summary: 'Get audit logs by actor (admin only)' })
  @ApiParam({
    name: 'actorUserId',
    description: 'User ID of the actor',
  })
  @ApiResponse({
    status: 200,
    description: 'Audit logs performed by the specified user',
    type: [AuditLog],
  })
  async getActorLogs(@Param('actorUserId') actorUserId: string): Promise<AuditLog[]> {
    return this.auditLogService.findByActor(actorUserId);
  }
}
