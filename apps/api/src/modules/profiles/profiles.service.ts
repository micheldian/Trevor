import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Profile, ProfileType } from './entities/profile.entity';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class ProfilesService {
  constructor(
    @InjectRepository(Profile)
    private profileRepository: Repository<Profile>,
  ) {}

  private formatWhatsAppNumber(phone: string): string | undefined {
    if (!phone || (typeof phone === 'string' && phone.trim() === '')) {
      return undefined;
    }

    // Remove all spaces, dots, and dashes
    let cleaned = phone.replace(/[\s.-]/g, '');

    // If starts with 06 or 07, convert to +336 or +337
    if (/^0[67]\d{8}$/.test(cleaned)) {
      return '+33' + cleaned.substring(1);
    }

    // If starts with 336 or 337, add +
    if (/^33[67]\d{8}$/.test(cleaned)) {
      return '+' + cleaned;
    }

    // If already starts with +33, return as is
    if (/^\+33[67]\d{8}$/.test(cleaned)) {
      return cleaned;
    }

    // Return cleaned value (will fail validation if invalid)
    return cleaned;
  }

  async create(userId: string, dto: CreateProfileDto): Promise<Profile> {
    // Check if user already has a profile of this type
    const existing = await this.profileRepository.findOne({
      where: { userId, type: dto.type },
    });

    if (existing) {
      throw new BadRequestException(
        `Vous avez déjà un profil de type ${dto.type}`,
      );
    }

    // Format WhatsApp number before saving
    const formattedDto = {
      ...dto,
      whatsappNumber: dto.whatsappNumber ? this.formatWhatsAppNumber(dto.whatsappNumber) : undefined,
    };

    const profile = this.profileRepository.create({
      userId,
      ...formattedDto,
    });

    return this.profileRepository.save(profile);
  }

  async findByUser(userId: string): Promise<Profile[]> {
    return this.profileRepository.find({
      where: { userId, isActive: true },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Profile> {
    const profile = await this.profileRepository.findOne({
      where: { id, isActive: true },
      relations: ['user'],
    });

    if (!profile) {
      throw new NotFoundException('Profil non trouvé');
    }

    return profile;
  }

  async update(
    userId: string,
    id: string,
    dto: UpdateProfileDto,
  ): Promise<Profile> {
    const profile = await this.profileRepository.findOne({
      where: { id },
    });

    if (!profile) {
      throw new NotFoundException('Profil non trouvé');
    }

    if (profile.userId !== userId) {
      throw new ForbiddenException('Non autorisé à modifier ce profil');
    }

    // Format WhatsApp number before updating
    const formattedDto = {
      ...dto,
      whatsappNumber: dto.whatsappNumber ? this.formatWhatsAppNumber(dto.whatsappNumber) : undefined,
    };

    Object.assign(profile, formattedDto);
    return this.profileRepository.save(profile);
  }

  async remove(userId: string, id: string): Promise<void> {
    const profile = await this.profileRepository.findOne({
      where: { id },
    });

    if (!profile) {
      throw new NotFoundException('Profil non trouvé');
    }

    if (profile.userId !== userId) {
      throw new ForbiddenException('Non autorisé à supprimer ce profil');
    }

    // Soft delete
    profile.isActive = false;
    await this.profileRepository.save(profile);
  }
}
