import { IsUUID, IsString, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO for merging two user accounts
 */
export class MergeUsersDto {
  @ApiProperty({
    description: 'Source user ID (will be deactivated after merge)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  @IsNotEmpty()
  sourceUserId: string;

  @ApiProperty({
    description: 'Target user ID (will receive all data from source)',
    example: '660e8400-e29b-41d4-a716-446655440001',
  })
  @IsUUID()
  @IsNotEmpty()
  targetUserId: string;

  @ApiProperty({
    description: 'Reason for merging these accounts',
    example: 'Duplicate account - same user registered twice with different emails',
  })
  @IsString()
  @IsNotEmpty()
  reason: string;

  @ApiProperty({
    description: 'Dry run mode - preview changes without executing',
    example: false,
    required: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  dryRun?: boolean;
}

/**
 * Response DTO for merge users operation
 */
export class MergeUsersResponseDto {
  @ApiProperty({
    description: 'Whether the merge was successful',
  })
  success: boolean;

  @ApiProperty({
    description: 'Detailed message about the operation',
  })
  message: string;

  @ApiProperty({
    description: 'Summary of transferred data',
  })
  transferSummary: {
    profilesTransferred: number;
    reviewsGivenTransferred: number;
    reviewsReceivedTransferred: number;
    matchesTransferred: number;
    jobsTransferred: number;
    availabilitiesTransferred: number;
  };

  @ApiProperty({
    description: 'Source user info (now deactivated)',
  })
  sourceUser: {
    id: string;
    email?: string;
    phone?: string;
    isActive: boolean;
    status: string;
  };

  @ApiProperty({
    description: 'Target user info (received all data)',
  })
  targetUser: {
    id: string;
    email?: string;
    phone?: string;
    profilesCount: number;
  };

  @ApiProperty({
    description: 'Audit log ID for this operation',
  })
  auditLogId?: string;

  @ApiProperty({
    description: 'Warnings or notices from the operation',
    required: false,
  })
  warnings?: string[];
}
