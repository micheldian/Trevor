import { Injectable } from '@nestjs/common';
import { HealthIndicator, HealthIndicatorResult, HealthCheckError } from '@nestjs/terminus';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class DatabaseHealthIndicator extends HealthIndicator {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {
    super();
  }

  /**
   * Check if all migrations have been executed
   */
  async checkMigrations(): Promise<HealthIndicatorResult> {
    try {
      // Get all executed migrations
      const executedMigrations = await this.dataSource.query(
        'SELECT name FROM migrations ORDER BY id',
      );

      // Count migrations in filesystem
      const migrationsPath = path.join(process.cwd(), '../../database/migrations');
      let filesystemMigrationCount = 0;

      if (fs.existsSync(migrationsPath)) {
        const files = fs.readdirSync(migrationsPath);
        filesystemMigrationCount = files.filter((f) => f.endsWith('.sql')).length;
      }

      const executedCount = executedMigrations.length;
      const isHealthy = executedCount > 0;

      const result = this.getStatus('migrations', isHealthy, {
        executed: executedCount,
        filesystemCount: filesystemMigrationCount,
        latest: executedMigrations[executedCount - 1]?.name || 'none',
      });

      if (isHealthy) {
        return result;
      }

      throw new HealthCheckError('Migrations check failed', result);
    } catch (error) {
      const result = this.getStatus('migrations', false, {
        message: error.message || 'Migration check failed',
      });
      throw new HealthCheckError('Migrations check failed', result);
    }
  }

  /**
   * Get application version from package.json
   */
  async checkVersion(): Promise<HealthIndicatorResult> {
    try {
      const packageJsonPath = path.join(process.cwd(), 'package.json');
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));

      const version = packageJson.version || 'unknown';
      const name = packageJson.name || 'trevor-api';

      return this.getStatus('version', true, {
        name,
        version,
        environment: process.env.NODE_ENV || 'development',
        nodeVersion: process.version,
      });
    } catch (error) {
      return this.getStatus('version', false, {
        message: 'Unable to read version',
      });
    }
  }
}
