import { Injectable, Logger } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Request } from 'express';
import { AuditLogService } from '../../audit-log/audit-log.service';
import {
  SystemStatusResponseDto,
  VersionInfoDto,
  DatabaseStatusDto,
  UptimeInfoDto,
} from '../dto/system-status.dto';
import * as fs from 'fs';
import * as path from 'path';

// Track server start time
const serverStartTime = new Date();

@Injectable()
export class AdminSystemService {
  private readonly logger = new Logger(AdminSystemService.name);

  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    private readonly auditLogService: AuditLogService,
  ) {}

  /**
   * Get comprehensive system status
   */
  async getSystemStatus(
    adminUserId: string,
    request?: Request,
  ): Promise<SystemStatusResponseDto> {
    const timestamp = new Date();

    // Get version info
    const version = await this.getVersionInfo();

    // Get database status
    const database = await this.getDatabaseStatus();

    // Get uptime info
    const uptime = this.getUptimeInfo();

    // Determine overall status
    let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
    if (!database.connected) {
      status = 'unhealthy';
    } else if (database.migrationsExecuted === 0) {
      status = 'degraded';
    }

    // Audit log
    await this.auditLogService.create({
      actorUserId: adminUserId,
      action: 'ADMIN_VIEW_SYSTEM_STATUS',
      entityType: 'system',
      entityId: undefined,
      beforeJson: undefined,
      afterJson: {
        status,
        version: version.version,
        environment: version.environment,
      },
      ipAddress: request?.ip,
      userAgent: request?.headers['user-agent'],
    });

    return {
      version,
      database,
      uptime,
      status,
      timestamp,
    };
  }

  /**
   * Get version information
   */
  private async getVersionInfo(): Promise<VersionInfoDto> {
    try {
      const packageJsonPath = path.join(process.cwd(), 'package.json');
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));

      return {
        name: packageJson.name || 'trevor-api',
        version: packageJson.version || 'unknown',
        environment: process.env.NODE_ENV || 'development',
        nodeVersion: process.version,
      };
    } catch (error) {
      this.logger.error('Failed to read version info', error);
      return {
        name: 'trevor-api',
        version: 'unknown',
        environment: process.env.NODE_ENV || 'development',
        nodeVersion: process.version,
      };
    }
  }

  /**
   * Get database status
   */
  private async getDatabaseStatus(): Promise<DatabaseStatusDto> {
    try {
      // Check connection
      const isConnected = this.dataSource.isInitialized;

      if (!isConnected) {
        return {
          connected: false,
          migrationsExecuted: 0,
          latestMigration: 'none',
        };
      }

      // Get executed migrations
      const migrations = await this.dataSource.query(
        'SELECT name FROM migrations ORDER BY id DESC LIMIT 1',
      );

      const migrationsCount = await this.dataSource.query('SELECT COUNT(*) FROM migrations');

      return {
        connected: true,
        migrationsExecuted: parseInt(migrationsCount[0].count, 10),
        latestMigration: migrations[0]?.name || 'none',
      };
    } catch (error) {
      this.logger.error('Failed to get database status', error);
      return {
        connected: false,
        migrationsExecuted: 0,
        latestMigration: 'error',
      };
    }
  }

  /**
   * Get uptime information
   */
  private getUptimeInfo(): UptimeInfoDto {
    const uptimeSeconds = Math.floor((Date.now() - serverStartTime.getTime()) / 1000);

    return {
      uptimeSeconds,
      startedAt: serverStartTime,
    };
  }
}
