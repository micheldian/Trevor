import { IsString, IsUUID, MaxLength, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTagAliasDto {
  @ApiProperty({
    description: 'Tag ID (the canonical tag)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  tagId: string;

  @ApiProperty({
    description: 'Alias name (variation)',
    example: 'pommes',
    minLength: 1,
    maxLength: 100,
  })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  alias: string;
}
