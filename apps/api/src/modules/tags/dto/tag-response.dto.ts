import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class TagAliasResponseDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  id: string;

  @ApiProperty({ example: 'pommes' })
  alias: string;

  @ApiProperty({ example: true })
  isActive: boolean;

  @ApiProperty({ example: '2025-12-27T00:00:00.000Z' })
  createdAt: Date;
}

export class TagResponseDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  id: string;

  @ApiProperty({ example: 'pomme' })
  name: string;

  @ApiProperty({ example: 'pomme' })
  slug: string;

  @ApiPropertyOptional({ example: 'culture' })
  category?: string;

  @ApiPropertyOptional({ example: 'Culture de pommes' })
  description?: string;

  @ApiProperty({ example: true })
  isActive: boolean;

  @ApiProperty({ example: 42 })
  usageCount: number;

  @ApiPropertyOptional({ type: [TagAliasResponseDto] })
  aliases?: TagAliasResponseDto[];

  @ApiProperty({ example: '2025-12-26T00:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2025-12-27T00:00:00.000Z' })
  updatedAt: Date;
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

export class PaginatedTagsResponseDto {
  @ApiProperty({ type: [TagResponseDto] })
  data: TagResponseDto[];

  @ApiProperty()
  meta: PaginationMetaDto;
}
