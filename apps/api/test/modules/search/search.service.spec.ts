import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { SearchService } from '../../../src/modules/search/search.service';
import { Availability } from '../../../src/modules/availability/entities/availability.entity';
import { Profile } from '../../../src/modules/profiles/entities/profile.entity';
import { SearchAvailableDto } from '../../../src/modules/search/dto/search-available.dto';
import {
  DateType,
  TimeSlot,
} from '../../../src/modules/availability/entities/availability.entity';
import { ProfileType } from '../../../src/modules/profiles/entities/profile.entity';

describe('SearchService', () => {
  let service: SearchService;
  let availabilityRepo: Repository<Availability>;
  let profileRepo: Repository<Profile>;
  let mockQueryBuilder: Partial<SelectQueryBuilder<Availability>>;

  const mockAvailability = {
    id: 'availability-1',
    profileId: 'profile-1',
    status: 'on',
    dateType: DateType.TODAY,
    timeSlot: TimeSlot.MORNING,
    latitude: 48.5734,
    longitude: 7.7521,
    radiusKm: 50,
    isActive: true,
    profile: {
      id: 'profile-1',
      userId: 'user-1',
      type: ProfileType.WORKER,
      bio: 'Experienced in viticulture',
      city: 'Strasbourg',
      postalCode: '67000',
      skills: ['viticulture', 'vendanges', 'pomme'],
      experienceYears: 10,
      certifications: ['CACES R372'],
      hasVehicle: true,
      ratingAvg: 4.5,
      ratingCount: 12,
      isActive: true,
      user: {
        id: 'user-1',
        firstName: 'Jean',
        lastName: 'Dupont',
        avatarUrl: 'https://example.com/avatar.jpg',
      },
    },
  };

  beforeEach(async () => {
    // Create mock query builder
    mockQueryBuilder = {
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      addSelect: jest.fn().mockReturnThis(),
      addOrderBy: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getCount: jest.fn().mockResolvedValue(1),
      getRawAndEntities: jest.fn().mockResolvedValue({
        entities: [mockAvailability],
        raw: [{ skills_matched: 2, distance: 5.2, completed_missions: 0 }],
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SearchService,
        {
          provide: getRepositoryToken(Availability),
          useValue: {
            createQueryBuilder: jest.fn(() => mockQueryBuilder),
            findOne: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Profile),
          useValue: {
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<SearchService>(SearchService);
    availabilityRepo = module.get<Repository<Availability>>(
      getRepositoryToken(Availability),
    );
    profileRepo = module.get<Repository<Profile>>(getRepositoryToken(Profile));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('searchAvailable', () => {
    it('should return paginated profile cards with default parameters', async () => {
      const dto: SearchAvailableDto = {};

      const result = await service.searchAvailable(dto);

      expect(result).toBeDefined();
      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(1);
      expect(result.meta.limit).toBe(20);
      expect(result.meta.offset).toBe(0);
      expect(availabilityRepo.createQueryBuilder).toHaveBeenCalled();
    });

    it('should filter by text query (q parameter)', async () => {
      const dto: SearchAvailableDto = { q: 'pomme' };

      await service.searchAvailable(dto);

      // Should call andWhere with text query filter (Brackets instance)
      expect(mockQueryBuilder.andWhere).toHaveBeenCalled();
      const calls = (mockQueryBuilder.andWhere as jest.Mock).mock.calls;
      const hasBracketsCall = calls.some(
        (call) => call[0] && typeof call[0] === 'object',
      );
      expect(hasBracketsCall).toBe(true);
    });

    it('should filter by dateType', async () => {
      const dto: SearchAvailableDto = { dateType: DateType.TODAY };

      await service.searchAvailable(dto);

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'availability.dateType = :dateType',
        { dateType: DateType.TODAY },
      );
    });

    it('should filter by timeSlot', async () => {
      const dto: SearchAvailableDto = { timeSlot: TimeSlot.MORNING };

      await service.searchAvailable(dto);

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'availability.timeSlot = :timeSlot',
        { timeSlot: TimeSlot.MORNING },
      );
    });

    it('should filter by minRating', async () => {
      const dto: SearchAvailableDto = { minRating: 4.0 };

      await service.searchAvailable(dto);

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'profile.ratingAvg >= :minRating',
        { minRating: 4.0 },
      );
    });

    it('should filter by hasVehicle', async () => {
      const dto: SearchAvailableDto = { hasVehicle: true };

      await service.searchAvailable(dto);

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'profile.hasVehicle = :hasVehicle',
        { hasVehicle: true },
      );
    });

    it('should filter onlyTeams (team_lead profiles)', async () => {
      const dto: SearchAvailableDto = { onlyTeams: true };

      await service.searchAvailable(dto);

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'profile.type = :type',
        { type: 'team_lead' },
      );
    });

    it('should parse skills and add match calculation', async () => {
      const dto: SearchAvailableDto = { skills: 'viticulture,vendanges' };

      await service.searchAvailable(dto);

      expect(mockQueryBuilder.addSelect).toHaveBeenCalledWith(
        expect.stringContaining('unnest(profile.skills)'),
        'skills_matched',
      );
      expect(mockQueryBuilder.addOrderBy).toHaveBeenCalledWith(
        'skills_matched',
        'DESC',
      );
    });

    it('should calculate distance when employerId is provided', async () => {
      const employerProfile = {
        id: 'employer-1',
        latitude: 48.5734,
        longitude: 7.7521,
      };

      jest
        .spyOn(profileRepo, 'findOne')
        .mockResolvedValue(employerProfile as any);
      jest.spyOn(availabilityRepo, 'findOne').mockResolvedValue({
        id: 'avail-1',
        latitude: 48.5734,
        longitude: 7.7521,
      } as any);

      const dto: SearchAvailableDto = {
        employerId: 'employer-1',
        maxDistanceKm: 50,
      };

      await service.searchAvailable(dto);

      expect(mockQueryBuilder.addSelect).toHaveBeenCalledWith(
        expect.stringContaining('6371 * acos'),
        'distance',
      );
      expect(mockQueryBuilder.addOrderBy).toHaveBeenCalledWith(
        'distance',
        'ASC',
      );
    });

    it('should apply maxDistanceKm filter when employerId is provided', async () => {
      jest.spyOn(profileRepo, 'findOne').mockResolvedValue({
        id: 'employer-1',
      } as any);
      jest.spyOn(availabilityRepo, 'findOne').mockResolvedValue({
        latitude: 48.5734,
        longitude: 7.7521,
      } as any);

      const dto: SearchAvailableDto = {
        employerId: 'employer-1',
        maxDistanceKm: 30,
      };

      await service.searchAvailable(dto);

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        expect.stringContaining('6371 * acos'),
        expect.objectContaining({ maxDistance: 30 }),
      );
    });

    it('should calculate match score correctly', async () => {
      const dto: SearchAvailableDto = {
        skills: 'viticulture,vendanges',
        maxDistanceKm: 50,
      };

      const result = await service.searchAvailable(dto);

      expect(result.data[0].matchScore).toBeGreaterThan(0);
      expect(result.data[0].matchScore).toBeLessThanOrEqual(100);
      expect(result.data[0].matchReasons).toBeDefined();
      expect(result.data[0].matchReasons.skillsMatched).toBe(2);
    });

    it('should return profile card with all required fields', async () => {
      const dto: SearchAvailableDto = {};

      const result = await service.searchAvailable(dto);

      const card = result.data[0];
      expect(card).toHaveProperty('id');
      expect(card).toHaveProperty('type');
      expect(card).toHaveProperty('firstName');
      expect(card).toHaveProperty('lastName');
      expect(card).toHaveProperty('city');
      expect(card).toHaveProperty('skills');
      expect(card).toHaveProperty('experienceYears');
      expect(card).toHaveProperty('hasVehicle');
      expect(card).toHaveProperty('ratingAvg');
      expect(card).toHaveProperty('ratingCount');
      expect(card).toHaveProperty('availability');
      expect(card).toHaveProperty('matchScore');
      expect(card).toHaveProperty('matchReasons');
      expect(card).toHaveProperty('whatsappNumber');
    });

    it('should handle pagination correctly', async () => {
      const dto: SearchAvailableDto = { limit: 10, offset: 5 };

      await service.searchAvailable(dto);

      expect(mockQueryBuilder.skip).toHaveBeenCalledWith(5);
      expect(mockQueryBuilder.take).toHaveBeenCalledWith(10);
    });

    it('should set hasMore to true when there are more results', async () => {
      mockQueryBuilder.getCount = jest.fn().mockResolvedValue(50);

      const dto: SearchAvailableDto = { limit: 20, offset: 0 };

      const result = await service.searchAvailable(dto);

      expect(result.meta.hasMore).toBe(true);
    });

    it('should set hasMore to false when no more results', async () => {
      mockQueryBuilder.getCount = jest.fn().mockResolvedValue(10);

      const dto: SearchAvailableDto = { limit: 20, offset: 0 };

      const result = await service.searchAvailable(dto);

      expect(result.meta.hasMore).toBe(false);
    });

    it('should include searchQuery in meta', async () => {
      const dto: SearchAvailableDto = { q: 'pomme' };

      const result = await service.searchAvailable(dto);

      expect(result.meta.searchQuery).toBe('pomme');
    });

    it('should include filters in meta', async () => {
      const dto: SearchAvailableDto = {
        dateType: DateType.TODAY,
        timeSlot: TimeSlot.MORNING,
        minRating: 4.0,
        maxDistanceKm: 50,
      };

      const result = await service.searchAvailable(dto);

      expect(result.meta.filters).toEqual({
        dateType: DateType.TODAY,
        timeSlot: TimeSlot.MORNING,
        minRating: 4.0,
        maxDistance: 50,
      });
    });

    it('should apply all sorting criteria in correct order', async () => {
      const dto: SearchAvailableDto = {
        skills: 'viticulture',
        employerId: 'employer-1',
      };

      jest.spyOn(profileRepo, 'findOne').mockResolvedValue({} as any);
      jest.spyOn(availabilityRepo, 'findOne').mockResolvedValue({
        latitude: 48.5734,
        longitude: 7.7521,
      } as any);

      await service.searchAvailable(dto);

      // Order should be: skills_matched DESC, ratingAvg DESC, completed_missions DESC, distance ASC
      expect(mockQueryBuilder.addOrderBy).toHaveBeenCalledWith(
        'skills_matched',
        'DESC',
      );
      expect(mockQueryBuilder.addOrderBy).toHaveBeenCalledWith(
        'profile.ratingAvg',
        'DESC',
      );
      expect(mockQueryBuilder.addOrderBy).toHaveBeenCalledWith(
        'completed_missions',
        'DESC',
      );
      expect(mockQueryBuilder.addOrderBy).toHaveBeenCalledWith(
        'distance',
        'ASC',
      );
    });

    it('should handle empty results', async () => {
      mockQueryBuilder.getCount = jest.fn().mockResolvedValue(0);
      mockQueryBuilder.getRawAndEntities = jest
        .fn()
        .mockResolvedValue({ entities: [], raw: [] });

      const dto: SearchAvailableDto = { q: 'nonexistent' };

      const result = await service.searchAvailable(dto);

      expect(result.data).toHaveLength(0);
      expect(result.meta.total).toBe(0);
      expect(result.meta.hasMore).toBe(false);
    });

    it('should handle profile without employer location', async () => {
      jest.spyOn(profileRepo, 'findOne').mockResolvedValue(null);

      const dto: SearchAvailableDto = { employerId: 'invalid-employer' };

      const result = await service.searchAvailable(dto);

      // Should still return results without distance calculation
      expect(result.data).toBeDefined();
    });

    it('should assign max distance score when no employerId provided', async () => {
      const dto: SearchAvailableDto = { skills: 'viticulture,vendanges' };

      const result = await service.searchAvailable(dto);

      // Match score should include the full 15 points for distance component
      expect(result.data[0].matchScore).toBeGreaterThan(0);
    });
  });
});
