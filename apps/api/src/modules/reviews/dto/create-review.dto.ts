import {
  IsUUID,
  IsNumber,
  IsString,
  IsBoolean,
  IsOptional,
  Min,
  Max,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateReviewDto {
  @ApiProperty({
    description: 'ID du match complété',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID('4')
  matchId: string;

  @ApiProperty({
    description: 'Note globale (1-5)',
    minimum: 1,
    maximum: 5,
    example: 4.5,
  })
  @IsNumber({ maxDecimalPlaces: 1 })
  @Min(1)
  @Max(5)
  rating: number;

  @ApiPropertyOptional({
    description: 'Professionnalisme (1-5)',
    minimum: 1,
    maximum: 5,
    example: 5,
  })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 1 })
  @Min(1)
  @Max(5)
  professionalism?: number;

  @ApiPropertyOptional({
    description: 'Ponctualité (1-5)',
    minimum: 1,
    maximum: 5,
    example: 4,
  })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 1 })
  @Min(1)
  @Max(5)
  punctuality?: number;

  @ApiPropertyOptional({
    description: 'Communication (1-5)',
    minimum: 1,
    maximum: 5,
    example: 4.5,
  })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 1 })
  @Min(1)
  @Max(5)
  communication?: number;

  @ApiPropertyOptional({
    description: 'Qualité du travail (1-5)',
    minimum: 1,
    maximum: 5,
    example: 5,
  })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 1 })
  @Min(1)
  @Max(5)
  quality?: number;

  @ApiPropertyOptional({
    description: 'Commentaire texte',
    example: 'Excellent travailleur, très professionnel',
  })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  comment?: string;

  @ApiPropertyOptional({
    description: 'La personne ne s\'est pas présentée (no-show)',
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  wasNoShow?: boolean;

  @ApiPropertyOptional({
    description: 'La mission a été annulée',
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  wasCancelled?: boolean;

  @ApiPropertyOptional({
    description: 'Raison de l\'annulation',
    example: 'Météo défavorable',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  cancellationReason?: string;

  @ApiPropertyOptional({
    description: 'Recommande pour une future collaboration',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  wouldWorkAgain?: boolean;
}
