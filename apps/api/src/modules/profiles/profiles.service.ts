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

    // Debug logging for whatsapp number
    if (dto.whatsappNumber) {
      console.log('[ProfilesService] WhatsApp number received:', dto.whatsappNumber);
      console.log('[ProfilesService] WhatsApp number length:', dto.whatsappNumber.length);
      console.log('[ProfilesService] WhatsApp number regex test:', /^\+33[0-9]{9}$/.test(dto.whatsappNumber));
    }

    const profile = this.profileRepository.create({
      userId,
      ...dto,
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

    Object.assign(profile, dto);
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
