import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Availability } from './entities/availability.entity';
import { Profile, ProfileType } from '../profiles/entities/profile.entity';
import { CreateAvailabilityDto } from './dto/create-availability.dto';
import { UpdateAvailabilityDto } from './dto/update-availability.dto';
import { AvailabilityFilterDto } from './dto/availability-filter.dto';

@Injectable()
export class AvailabilityService {
  constructor(
    @InjectRepository(Availability)
    private readonly availabilityRepository: Repository<Availability>,
    @InjectRepository(Profile)
    private readonly profileRepository: Repository<Profile>,
  ) {}

  /**
   * Créer une disponibilité
   */
  async create(
    userId: string,
    profileId: string,
    dto: CreateAvailabilityDto,
  ): Promise<Availability> {
    // Vérifier que le profil appartient à l'utilisateur
    const profile = await this.profileRepository.findOne({
      where: { id: profileId, userId },
    });

    if (!profile) {
      throw new NotFoundException('Profil non trouvé');
    }

    // Vérifier que le profil est worker ou team_lead
    if (![ProfileType.WORKER, ProfileType.TEAM_LEAD].includes(profile.type)) {
      throw new ForbiddenException(
        'Seuls les workers et team leads peuvent créer des disponibilités',
      );
    }

    // Créer la disponibilité
    const availability = this.availabilityRepository.create({
      profileId,
      ...dto,
    });

    return this.availabilityRepository.save(availability);
  }

  /**
   * Récupérer toutes les disponibilités (avec filtres)
   */
  async findAll(filters: AvailabilityFilterDto): Promise<{
    data: Availability[];
    meta: {
      total: number;
      limit: number;
      offset: number;
      hasMore: boolean;
    };
  }> {
    const qb = this.availabilityRepository
      .createQueryBuilder('availability')
      .leftJoinAndSelect('availability.profile', 'profile')
      .leftJoinAndSelect('profile.user', 'user')
      .where('availability.isActive = :isActive', { isActive: true });

    // Filtres
    if (filters.profileId) {
      qb.andWhere('availability.profileId = :profileId', {
        profileId: filters.profileId,
      });
    }

    if (filters.status) {
      qb.andWhere('availability.status = :status', { status: filters.status });
    }

    if (filters.dateType) {
      qb.andWhere('availability.dateType = :dateType', {
        dateType: filters.dateType,
      });
    }

    if (filters.timeSlot) {
      qb.andWhere('availability.timeSlot = :timeSlot', {
        timeSlot: filters.timeSlot,
      });
    }

    // Recherche géospatiale (distance en km)
    if (filters.latitude && filters.longitude) {
      const maxDistance = filters.maxDistance || 50;
      qb.andWhere(
        `(
          6371 * acos(
            cos(radians(:lat)) * cos(radians(availability.latitude)) *
            cos(radians(availability.longitude) - radians(:lng)) +
            sin(radians(:lat)) * sin(radians(availability.latitude))
          )
        ) <= :maxDistance`,
        {
          lat: filters.latitude,
          lng: filters.longitude,
          maxDistance,
        },
      );
    }

    // Pagination
    const total = await qb.getCount();
    const data = await qb
      .orderBy('availability.createdAt', 'DESC')
      .skip(filters.offset || 0)
      .take(filters.limit || 20)
      .getMany();

    return {
      data,
      meta: {
        total,
        limit: filters.limit || 20,
        offset: filters.offset || 0,
        hasMore: total > (filters.offset || 0) + (filters.limit || 20),
      },
    };
  }

  /**
   * Récupérer une disponibilité par ID
   */
  async findOne(id: string): Promise<Availability> {
    const availability = await this.availabilityRepository.findOne({
      where: { id, isActive: true },
      relations: ['profile', 'profile.user'],
    });

    if (!availability) {
      throw new NotFoundException('Disponibilité non trouvée');
    }

    return availability;
  }

  /**
   * Mettre à jour une disponibilité
   */
  async update(
    id: string,
    userId: string,
    dto: UpdateAvailabilityDto,
  ): Promise<Availability> {
    const availability = await this.findOne(id);

    // Vérifier ownership
    const profile = await this.profileRepository.findOne({
      where: { id: availability.profileId },
    });

    if (profile.userId !== userId) {
      throw new ForbiddenException(
        'Vous ne pouvez modifier que vos propres disponibilités',
      );
    }

    // Update
    Object.assign(availability, dto);
    return this.availabilityRepository.save(availability);
  }

  /**
   * Supprimer une disponibilité (soft delete)
   */
  async remove(id: string, userId: string): Promise<void> {
    const availability = await this.findOne(id);

    // Vérifier ownership
    const profile = await this.profileRepository.findOne({
      where: { id: availability.profileId },
    });

    if (profile.userId !== userId) {
      throw new ForbiddenException(
        'Vous ne pouvez supprimer que vos propres disponibilités',
      );
    }

    // Soft delete
    availability.isActive = false;
    await this.availabilityRepository.save(availability);
  }

  /**
   * Récupérer les disponibilités à proximité (géospatiale)
   */
  async findNearby(
    latitude: number,
    longitude: number,
    radiusKm: number = 50,
  ): Promise<Availability[]> {
    return this.availabilityRepository
      .createQueryBuilder('availability')
      .leftJoinAndSelect('availability.profile', 'profile')
      .leftJoinAndSelect('profile.user', 'user')
      .where('availability.isActive = :isActive', { isActive: true })
      .andWhere('availability.status = :status', { status: 'on' })
      .andWhere(
        `(
          6371 * acos(
            cos(radians(:lat)) * cos(radians(availability.latitude)) *
            cos(radians(availability.longitude) - radians(:lng)) +
            sin(radians(:lat)) * sin(radians(availability.latitude))
          )
        ) <= :radius`,
        { lat: latitude, lng: longitude, radius: radiusKm },
      )
      .orderBy(
        `(
          6371 * acos(
            cos(radians(:lat)) * cos(radians(availability.latitude)) *
            cos(radians(availability.longitude) - radians(:lng)) +
            sin(radians(:lat)) * sin(radians(availability.latitude))
          )
        )`,
        'ASC',
      )
      .setParameter('lat', latitude)
      .setParameter('lng', longitude)
      .getMany();
  }
}
