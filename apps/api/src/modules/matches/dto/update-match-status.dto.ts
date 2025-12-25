import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MatchStatus } from '../entities/match.entity';

export class UpdateMatchStatusDto {
  @ApiProperty({
    description: 'Nouveau statut du match',
    enum: MatchStatus,
    example: MatchStatus.INTERESTED,
  })
  @IsEnum(MatchStatus)
  status: MatchStatus;

  @ApiPropertyOptional({
    description: 'Notes (employer ou candidat selon qui fait l\'action)',
    example: 'Intéressé par cette mission',
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;
}
