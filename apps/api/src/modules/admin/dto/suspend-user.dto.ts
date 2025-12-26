import { IsString, IsNotEmpty, IsOptional, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO for suspending a user
 */
export class SuspendUserDto {
  @ApiProperty({
    description: 'Reason for suspending the user',
    example: 'Violation of terms of service - posted inappropriate content',
  })
  @IsString()
  @IsNotEmpty()
  reason: string;

  @ApiProperty({
    description:
      'Date/time when the suspension expires (ISO 8601). If not provided, suspension is indefinite.',
    example: '2025-01-15T00:00:00Z',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  suspendUntil?: string;
}

/**
 * DTO for banning a user
 */
export class BanUserDto {
  @ApiProperty({
    description: 'Reason for banning the user permanently',
    example: 'Repeated violations - fraud and harassment',
  })
  @IsString()
  @IsNotEmpty()
  reason: string;
}
