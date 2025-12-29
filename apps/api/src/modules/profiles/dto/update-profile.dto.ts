import { PartialType } from '@nestjs/swagger';
import { CreateProfileDto } from './create-profile.dto';
import { OmitType } from '@nestjs/swagger';

export class UpdateProfileDto extends PartialType(
  OmitType(CreateProfileDto, ['type'] as const),
) {}
