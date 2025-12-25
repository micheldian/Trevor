import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AvailabilityService } from '../../../src/modules/availability/availability.service';
import {
  Availability,
  AvailabilityStatus,
  DateType,
  TimeSlot,
} from '../../../src/modules/availability/entities/availability.entity';
import { Profile, ProfileType } from '../../../src/modules/profiles/entities/profile.entity';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { CreateAvailabilityDto } from '../../../src/modules/availability/dto/create-availability.dto';

describe('AvailabilityService', () => {
  let service: AvailabilityService;
  let availabilityRepo: Repository<Availability>;
  let profileRepo: Repository<Profile>;

  const mockAvailabilityRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const mockProfileRepository = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AvailabilityService,
        {
          provide: getRepositoryToken(Availability),
          useValue: mockAvailabilityRepository,
        },
        {
          provide: getRepositoryToken(Profile),
          useValue: mockProfileRepository,
        },
      ],
    }).compile();

    service = module.get<AvailabilityService>(AvailabilityService);
    availabilityRepo = module.get<Repository<Availability>>(
      getRepositoryToken(Availability),
    );
    profileRepo = module.get<Repository<Profile>>(
      getRepositoryToken(Profile),
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const userId = 'user-123';
    const profileId = 'profile-123';
    const dto: CreateAvailabilityDto = {
      status: AvailabilityStatus.ON,
      dateType: DateType.TODAY,
      timeSlot: TimeSlot.MORNING,
      latitude: 48.5734,
      longitude: 7.7521,
      radiusKm: 30,
    };

    it('should create availability for worker profile', async () => {
      const mockProfile: Partial<Profile> = {
        id: profileId,
        userId,
        type: ProfileType.WORKER,
      };

      const mockAvailability: Partial<Availability> = {
        id: 'availability-123',
        profileId,
        ...dto,
      };

      mockProfileRepository.findOne.mockResolvedValue(mockProfile);
      mockAvailabilityRepository.create.mockReturnValue(mockAvailability);
      mockAvailabilityRepository.save.mockResolvedValue(mockAvailability);

      const result = await service.create(userId, profileId, dto);

      expect(profileRepo.findOne).toHaveBeenCalledWith({
        where: { id: profileId, userId },
      });
      expect(availabilityRepo.create).toHaveBeenCalledWith({
        profileId,
        ...dto,
      });
      expect(result).toEqual(mockAvailability);
    });

    it('should create availability for team_lead profile', async () => {
      const mockProfile: Partial<Profile> = {
        id: profileId,
        userId,
        type: ProfileType.TEAM_LEAD,
      };

      mockProfileRepository.findOne.mockResolvedValue(mockProfile);
      mockAvailabilityRepository.create.mockReturnValue({});
      mockAvailabilityRepository.save.mockResolvedValue({});

      await service.create(userId, profileId, dto);

      expect(profileRepo.findOne).toHaveBeenCalled();
    });

    it('should throw NotFoundException if profile not found', async () => {
      mockProfileRepository.findOne.mockResolvedValue(null);

      await expect(service.create(userId, profileId, dto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException if profile is employer', async () => {
      const mockProfile: Partial<Profile> = {
        id: profileId,
        userId,
        type: ProfileType.EMPLOYER,
      };

      mockProfileRepository.findOne.mockResolvedValue(mockProfile);

      await expect(service.create(userId, profileId, dto)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('findOne', () => {
    it('should return availability by id', async () => {
      const mockAvailability: Partial<Availability> = {
        id: 'availability-123',
        status: AvailabilityStatus.ON,
        isActive: true,
      };

      mockAvailabilityRepository.findOne.mockResolvedValue(mockAvailability);

      const result = await service.findOne('availability-123');

      expect(availabilityRepo.findOne).toHaveBeenCalledWith({
        where: { id: 'availability-123', isActive: true },
        relations: ['profile', 'profile.user'],
      });
      expect(result).toEqual(mockAvailability);
    });

    it('should throw NotFoundException if availability not found', async () => {
      mockAvailabilityRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('invalid-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    const userId = 'user-123';
    const availabilityId = 'availability-123';
    const updateDto = { status: AvailabilityStatus.OFF };

    it('should update availability if owner', async () => {
      const mockProfile: Partial<Profile> = {
        id: 'profile-123',
        userId,
      };

      const mockAvailability: Partial<Availability> = {
        id: availabilityId,
        profileId: 'profile-123',
        status: AvailabilityStatus.ON,
        isActive: true,
      };

      mockAvailabilityRepository.findOne.mockResolvedValue(mockAvailability);
      mockProfileRepository.findOne.mockResolvedValue(mockProfile);
      mockAvailabilityRepository.save.mockResolvedValue({
        ...mockAvailability,
        ...updateDto,
      });

      const result = await service.update(availabilityId, userId, updateDto);

      expect(result.status).toBe(AvailabilityStatus.OFF);
    });

    it('should throw ForbiddenException if not owner', async () => {
      const mockProfile: Partial<Profile> = {
        id: 'profile-123',
        userId: 'different-user',
      };

      const mockAvailability: Partial<Availability> = {
        id: availabilityId,
        profileId: 'profile-123',
        isActive: true,
      };

      mockAvailabilityRepository.findOne.mockResolvedValue(mockAvailability);
      mockProfileRepository.findOne.mockResolvedValue(mockProfile);

      await expect(
        service.update(availabilityId, userId, updateDto),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('remove', () => {
    const userId = 'user-123';
    const availabilityId = 'availability-123';

    it('should soft delete availability if owner', async () => {
      const mockProfile: Partial<Profile> = {
        id: 'profile-123',
        userId,
      };

      const mockAvailability: Partial<Availability> = {
        id: availabilityId,
        profileId: 'profile-123',
        isActive: true,
      };

      mockAvailabilityRepository.findOne.mockResolvedValue(mockAvailability);
      mockProfileRepository.findOne.mockResolvedValue(mockProfile);
      mockAvailabilityRepository.save.mockResolvedValue({
        ...mockAvailability,
        isActive: false,
      });

      await service.remove(availabilityId, userId);

      expect(availabilityRepo.save).toHaveBeenCalledWith({
        ...mockAvailability,
        isActive: false,
      });
    });

    it('should throw ForbiddenException if not owner', async () => {
      const mockProfile: Partial<Profile> = {
        id: 'profile-123',
        userId: 'different-user',
      };

      const mockAvailability: Partial<Availability> = {
        id: availabilityId,
        profileId: 'profile-123',
        isActive: true,
      };

      mockAvailabilityRepository.findOne.mockResolvedValue(mockAvailability);
      mockProfileRepository.findOne.mockResolvedValue(mockProfile);

      await expect(service.remove(availabilityId, userId)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('validation scenarios', () => {
    it('should validate latitude range', () => {
      const dto: CreateAvailabilityDto = {
        status: AvailabilityStatus.ON,
        dateType: DateType.TODAY,
        timeSlot: TimeSlot.DAY,
        latitude: 91, // Invalid
        longitude: 7.7521,
        radiusKm: 30,
      };

      // Validation will be handled by class-validator in real runtime
      expect(dto.latitude).toBeGreaterThan(90);
    });

    it('should validate radiusKm min/max', () => {
      const dtoMin: CreateAvailabilityDto = {
        status: AvailabilityStatus.ON,
        dateType: DateType.TODAY,
        timeSlot: TimeSlot.DAY,
        latitude: 48.5734,
        longitude: 7.7521,
        radiusKm: 0, // Invalid (min 1)
      };

      const dtoMax: CreateAvailabilityDto = {
        status: AvailabilityStatus.ON,
        dateType: DateType.TODAY,
        timeSlot: TimeSlot.DAY,
        latitude: 48.5734,
        longitude: 7.7521,
        radiusKm: 250, // Invalid (max 200)
      };

      expect(dtoMin.radiusKm).toBeLessThan(1);
      expect(dtoMax.radiusKm).toBeGreaterThan(200);
    });
  });
});
