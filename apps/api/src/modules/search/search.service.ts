import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Brackets } from 'typeorm';
import { Availability } from '../availability/entities/availability.entity';
import { Profile } from '../profiles/entities/profile.entity';
import { SearchAvailableDto } from './dto/search-available.dto';
import {
  ProfileCard,
  SearchAvailableResponse,
} from './interfaces/profile-card.interface';

@Injectable()
export class SearchService {
  private readonly logger = new Logger(SearchService.name);

  constructor(
    @InjectRepository(Availability)
    private readonly availabilityRepo: Repository<Availability>,
    @InjectRepository(Profile)
    private readonly profileRepo: Repository<Profile>,
  ) {}

  /**
   * Recherche de profils disponibles avec tri sophistiqué
   */
  async searchAvailable(
    dto: SearchAvailableDto,
  ): Promise<SearchAvailableResponse> {
    const {
      q,
      dateType,
      timeSlot,
      onlyTeams,
      hasVehicle,
      minRating,
      maxDistanceKm,
      employerId,
      skills,
      limit = 20,
      offset = 0,
    } = dto;

    // Récupérer position de l'employer si fourni
    let employerLat: number | null = null;
    let employerLng: number | null = null;

    if (employerId) {
      const employerProfile = await this.profileRepo.findOne({
        where: { id: employerId },
      });
      if (employerProfile) {
        // Supposons qu'on ajoute latitude/longitude au profil
        // Pour l'instant, on utilisera la position de la dernière availability
        const lastAvailability = await this.availabilityRepo.findOne({
          where: { profileId: employerId },
          order: { createdAt: 'DESC' },
        });
        if (lastAvailability) {
          employerLat = Number(lastAvailability.latitude);
          employerLng = Number(lastAvailability.longitude);
        }
      }
    }

    // Parsing skills
    const skillsArray = skills ? skills.split(',').map((s) => s.trim()) : [];

    // Query builder complexe
    const qb = this.availabilityRepo
      .createQueryBuilder('availability')
      .leftJoinAndSelect('availability.profile', 'profile')
      .leftJoinAndSelect('profile.user', 'user')
      .where('availability.isActive = :isActive', { isActive: true })
      .andWhere('availability.status = :status', { status: 'on' })
      .andWhere('profile.isActive = :profileActive', { profileActive: true });

    // Filtres date/slot
    if (dateType) {
      qb.andWhere('availability.dateType = :dateType', { dateType });
    }

    if (timeSlot) {
      qb.andWhere('availability.timeSlot = :timeSlot', { timeSlot });
    }

    // Filtre minRating
    if (minRating !== undefined) {
      qb.andWhere('profile.ratingAvg >= :minRating', { minRating });
    }

    // Filtre hasVehicle
    if (hasVehicle) {
      qb.andWhere('profile.hasVehicle = :hasVehicle', { hasVehicle: true });
    }

    // Filtre onlyTeams (pour V1, on suppose que teams = profiles avec type team_lead)
    // En V2, on ajouterait une jointure avec la table teams
    if (onlyTeams) {
      qb.andWhere('profile.type = :type', { type: 'team_lead' });
    }

    // Recherche textuelle (q)
    if (q) {
      qb.andWhere(
        new Brackets((qbBracket) => {
          qbBracket
            .where('profile.bio ILIKE :query', { query: `%${q}%` })
            .orWhere('profile.city ILIKE :query', { query: `%${q}%` })
            .orWhere('user.firstName ILIKE :query', { query: `%${q}%` })
            .orWhere('user.lastName ILIKE :query', { query: `%${q}%` })
            .orWhere('profile.skills::text ILIKE :query', {
              query: `%${q}%`,
            });
        }),
      );
    }

    // Calcul distance si employerLat/Lng fournis
    if (employerLat !== null && employerLng !== null) {
      qb.addSelect(
        `(
          6371 * acos(
            cos(radians(${employerLat})) * cos(radians(availability.latitude)) *
            cos(radians(availability.longitude) - radians(${employerLng})) +
            sin(radians(${employerLat})) * sin(radians(availability.latitude))
          )
        )`,
        'distance',
      );

      // Filtre maxDistance
      if (maxDistanceKm) {
        qb.andWhere(
          `(
            6371 * acos(
              cos(radians(:lat)) * cos(radians(availability.latitude)) *
              cos(radians(availability.longitude) - radians(:lng)) +
              sin(radians(:lat)) * sin(radians(availability.latitude))
            )
          ) <= :maxDistance`,
          {
            lat: employerLat,
            lng: employerLng,
            maxDistance: maxDistanceKm,
          },
        );
      }
    }

    // Calcul score de match compétences
    if (skillsArray.length > 0) {
      // PostgreSQL: COUNT overlap skills
      const skillsPlaceholder = skillsArray.map((s) => `'${s}'`).join(',');
      qb.addSelect(
        `(
          SELECT COUNT(*)
          FROM unnest(profile.skills) AS skill
          WHERE skill = ANY(ARRAY[${skillsPlaceholder}])
        )`,
        'skills_matched',
      );
    } else {
      qb.addSelect('0', 'skills_matched');
    }

    // Nombre de missions complétées (à implémenter avec table matches)
    // Pour V1, on simule avec 0
    qb.addSelect('0', 'completed_missions');

    // TRI SOPHISTIQUÉ
    // 1. Score match compétences (DESC)
    if (skillsArray.length > 0) {
      qb.addOrderBy('skills_matched', 'DESC');
    }

    // 2. Rating (DESC)
    qb.addOrderBy('profile.ratingAvg', 'DESC');

    // 3. Nombre missions (DESC) - V2
    qb.addOrderBy('completed_missions', 'DESC');

    // 4. Distance (ASC) - si géolocalisation active
    if (employerLat !== null && employerLng !== null) {
      qb.addOrderBy('distance', 'ASC');
    }

    // Count total
    const total = await qb.getCount();

    // Récupérer résultats avec pagination
    const results = await qb
      .skip(offset)
      .take(limit)
      .getRawAndEntities();

    // Transformer en ProfileCard
    const data: ProfileCard[] = results.entities.map((availability, index) => {
      const raw = results.raw[index];
      const profile = availability.profile;
      const user = profile.user;

      const skillsMatched = Number(raw.skills_matched || 0);
      const distance = raw.distance ? Number(raw.distance) : undefined;
      const completedMissions = Number(raw.completed_missions || 0);

      // Calcul match score (0-100)
      let matchScore = 0;

      // Compétences (40 points)
      if (skillsArray.length > 0) {
        matchScore += (skillsMatched / skillsArray.length) * 40;
      }

      // Rating (30 points)
      matchScore += (Number(profile.ratingAvg) / 5) * 30;

      // Expérience (15 points)
      matchScore += Math.min(profile.experienceYears / 10, 1) * 15;

      // Distance (15 points) - inversé (plus proche = meilleur score)
      if (distance !== undefined && maxDistanceKm) {
        matchScore += ((maxDistanceKm - distance) / maxDistanceKm) * 15;
      } else {
        matchScore += 15; // Score max si pas de distance
      }

      return {
        id: profile.id,
        type: profile.type === 'team_lead' ? 'team_lead' : 'worker',
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        avatarUrl: user.avatarUrl,
        city: profile.city,
        postalCode: profile.postalCode,
        bio: profile.bio,
        skills: profile.skills || [],
        experienceYears: profile.experienceYears,
        certifications: profile.certifications || [],
        hasVehicle: profile.hasVehicle || false,
        ratingAvg: Number(profile.ratingAvg),
        ratingCount: profile.ratingCount,
        completedMissions,
        availability: {
          id: availability.id,
          dateType: availability.dateType,
          timeSlot: availability.timeSlot,
          status: availability.status,
          notes: availability.notes,
        },
        distance,
        matchScore: Math.round(matchScore),
        matchReasons: {
          skillsMatched,
          totalSkills: skillsArray.length,
          hasVehicle: profile.hasVehicle || false,
          rating: Number(profile.ratingAvg),
          experience: profile.experienceYears,
          distance,
        },
        whatsappNumber: profile.whatsappNumber,
      };
    });

    return {
      data,
      meta: {
        total,
        limit,
        offset,
        hasMore: total > offset + limit,
        searchQuery: q,
        filters: {
          dateType,
          timeSlot,
          minRating,
          maxDistance: maxDistanceKm,
        },
      },
    };
  }
}
