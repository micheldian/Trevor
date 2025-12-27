import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ReportTargetType, ReportReason, ReportStatus } from '../entities/report.entity';

export class ReportResponseDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  id: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174001' })
  reporterId: string;

  @ApiProperty({ enum: ReportTargetType, example: ReportTargetType.REVIEW })
  targetType: ReportTargetType;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174002' })
  targetId: string;

  @ApiProperty({ enum: ReportReason, example: ReportReason.INAPPROPRIATE })
  reason: ReportReason;

  @ApiPropertyOptional({ example: 'Contains offensive language' })
  note?: string;

  @ApiProperty({ enum: ReportStatus, example: ReportStatus.OPEN })
  status: ReportStatus;

  @ApiPropertyOptional({ example: 'Reviewed and content removed' })
  resolutionNote?: string;

  @ApiPropertyOptional({ example: '123e4567-e89b-12d3-a456-426614174003' })
  resolvedById?: string;

  @ApiPropertyOptional({ example: '2025-12-27T00:00:00.000Z' })
  resolvedAt?: Date;

  @ApiProperty({ example: '2025-12-26T00:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2025-12-27T00:00:00.000Z' })
  updatedAt: Date;
}

export class ReporterInfoDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  id: string;

  @ApiProperty({ example: 'John' })
  firstName: string;

  @ApiProperty({ example: 'Doe' })
  lastName: string;

  @ApiProperty({ example: 'john.doe@example.com' })
  email: string;
}

export class AdminReportResponseDto extends ReportResponseDto {
  @ApiPropertyOptional()
  reporter?: ReporterInfoDto;

  @ApiPropertyOptional()
  resolvedBy?: ReporterInfoDto;
}

export class PaginationMetaDto {
  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 20 })
  limit: number;

  @ApiProperty({ example: 100 })
  total: number;

  @ApiProperty({ example: 5 })
  totalPages: number;
}

export class PaginatedReportsResponseDto {
  @ApiProperty({ type: [AdminReportResponseDto] })
  data: AdminReportResponseDto[];

  @ApiProperty()
  meta: PaginationMetaDto;
}
