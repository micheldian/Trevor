import { IsUUID, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateMatchDto {
  @ApiProperty({
    description: 'ID du job (mission)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID('4')
  jobId: string;

  @ApiProperty({
    description: 'ID du profil candidat (worker ou team_lead)',
    example: '123e4567-e89b-12d3-a456-426614174001',
  })
  @IsUUID('4')
  candidateId: string;

  @ApiPropertyOptional({
    description: 'Notes de l\'employeur',
    example: 'Profil intéressant, compétences en viticulture',
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  employerNotes?: string;
}
