import { ApiProperty } from '@nestjs/swagger';

export class DatabaseStatusDto {
  @ApiProperty({ description: 'Database connection status' })
  connected: boolean;

  @ApiProperty({ description: 'Number of executed migrations' })
  migrationsExecuted: number;

  @ApiProperty({ description: 'Latest migration name' })
  latestMigration: string;
}

export class VersionInfoDto {
  @ApiProperty({ description: 'Application name' })
  name: string;

  @ApiProperty({ description: 'Application version' })
  version: string;

  @ApiProperty({ description: 'Environment (development, production, etc.)' })
  environment: string;

  @ApiProperty({ description: 'Node.js version' })
  nodeVersion: string;
}

export class UptimeInfoDto {
  @ApiProperty({ description: 'Server uptime in seconds' })
  uptimeSeconds: number;

  @ApiProperty({ description: 'Server started at timestamp' })
  startedAt: Date;
}

export class SystemStatusResponseDto {
  @ApiProperty({ type: VersionInfoDto })
  version: VersionInfoDto;

  @ApiProperty({ type: DatabaseStatusDto })
  database: DatabaseStatusDto;

  @ApiProperty({ type: UptimeInfoDto })
  uptime: UptimeInfoDto;

  @ApiProperty({ description: 'Overall system health status' })
  status: 'healthy' | 'degraded' | 'unhealthy';

  @ApiProperty()
  timestamp: Date;
}
