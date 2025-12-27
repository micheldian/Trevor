import { IsString, IsOptional, IsEnum, MaxLength, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TagCategory } from '../entities/tag.entity';

export class CreateTagDto {
  @ApiProperty({
    description: 'Tag name (canonical form)',
    example: 'pomme',
    minLength: 1,
    maxLength: 100,
  })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name: string;

  @ApiPropertyOptional({
    description: 'Tag category',
    enum: TagCategory,
    example: TagCategory.CULTURE,
  })
  @IsOptional()
  @IsEnum(TagCategory)
  category?: TagCategory;

  @ApiPropertyOptional({
    description: 'Tag description',
    example: 'Culture de pommes',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;
}
