import { IsString, IsOptional, IsEnum, IsBoolean, MaxLength, MinLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { TagCategory } from '../entities/tag.entity';

export class UpdateTagDto {
  @ApiPropertyOptional({
    description: 'Tag name',
    example: 'pomme',
  })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({
    description: 'Tag category',
    enum: TagCategory,
  })
  @IsOptional()
  @IsEnum(TagCategory)
  category?: TagCategory;

  @ApiPropertyOptional({
    description: 'Tag description',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiPropertyOptional({
    description: 'Tag active status',
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
