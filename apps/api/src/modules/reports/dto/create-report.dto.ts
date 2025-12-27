import { IsEnum, IsUUID, IsString, IsOptional, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ReportTargetType, ReportReason } from '../entities/report.entity';

export class CreateReportDto {
  @ApiProperty({
    description: 'Type of entity being reported',
    enum: ReportTargetType,
    example: ReportTargetType.REVIEW,
  })
  @IsEnum(ReportTargetType)
  targetType: ReportTargetType;

  @ApiProperty({
    description: 'UUID of the entity being reported',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  targetId: string;

  @ApiProperty({
    description: 'Reason for reporting',
    enum: ReportReason,
    example: ReportReason.INAPPROPRIATE,
  })
  @IsEnum(ReportReason)
  reason: ReportReason;

  @ApiPropertyOptional({
    description: 'Additional details about the report (optional)',
    example: 'This review contains offensive language',
    maxLength: 1000,
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  note?: string;
}
