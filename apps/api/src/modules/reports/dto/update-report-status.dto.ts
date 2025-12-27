import { IsEnum, IsString, IsOptional, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ReportStatus } from '../entities/report.entity';

export class UpdateReportStatusDto {
  @ApiProperty({
    description: 'New status for the report',
    enum: ReportStatus,
    example: ReportStatus.CLOSED,
  })
  @IsEnum(ReportStatus)
  status: ReportStatus;

  @ApiPropertyOptional({
    description: 'Admin note explaining the resolution',
    example: 'Reviewed and removed inappropriate content',
    maxLength: 1000,
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  resolutionNote?: string;
}
