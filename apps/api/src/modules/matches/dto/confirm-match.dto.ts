import { IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class ConfirmMatchDto {
  @ApiPropertyOptional({
    description: 'Notes de confirmation (optionnel)',
    example: 'Mission confirmée avec Jean Dupont',
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;
}
