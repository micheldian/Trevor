import { IsOptional, IsEnum, IsUUID, IsInt, Min, Max } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { ReportTargetType, ReportReason, ReportStatus } from '../entities/report.entity';

export class GetReportsQueryDto {
  @ApiPropertyOptional({ example: 1, minimum: 1, description: 'Page number' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ example: 20, minimum: 1, maximum: 100, description: 'Items per page' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @ApiPropertyOptional({ enum: ReportStatus, description: 'Filter by report status' })
  @IsOptional()
  @IsEnum(ReportStatus)
  status?: ReportStatus;

  @ApiPropertyOptional({ enum: ReportTargetType, description: 'Filter by target type' })
  @IsOptional()
  @IsEnum(ReportTargetType)
  targetType?: ReportTargetType;

  @ApiPropertyOptional({ enum: ReportReason, description: 'Filter by report reason' })
  @IsOptional()
  @IsEnum(ReportReason)
  reason?: ReportReason;

  @ApiPropertyOptional({ description: 'Filter by reporter user ID' })
  @IsOptional()
  @IsUUID()
  reporterId?: string;

  @ApiPropertyOptional({ description: 'Filter by target entity ID' })
  @IsOptional()
  @IsUUID()
  targetId?: string;

  @ApiPropertyOptional({ enum: ['createdAt', 'updatedAt', 'resolvedAt'], description: 'Sort field', default: 'createdAt' })
  @IsOptional()
  @IsEnum(['createdAt', 'updatedAt', 'resolvedAt'])
  sortBy?: string = 'createdAt';

  @ApiPropertyOptional({ enum: ['ASC', 'DESC'], description: 'Sort order', default: 'DESC' })
  @IsOptional()
  @Transform(({ value }) => value?.toUpperCase())
  @IsEnum(['ASC', 'DESC'])
  sortOrder?: 'ASC' | 'DESC' = 'DESC';
}
