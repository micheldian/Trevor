import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { JobStatus } from '../entities/job.entity';

export class TransitionJobStatusDto {
  @ApiProperty({
    description: 'Nouveau statut de la mission',
    enum: JobStatus,
    example: JobStatus.PUBLISHED,
  })
  @IsEnum(JobStatus)
  status: JobStatus;

  @ApiPropertyOptional({
    description: 'Raison (requis pour annulation)',
    example: 'Mission annulée par manque de candidats',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;
}
