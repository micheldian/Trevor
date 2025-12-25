import { Test, TestingModule } from '@nestjs/testing';
import { AvailabilityController } from '../../../src/modules/availability/availability.controller';
import { AvailabilityService } from '../../../src/modules/availability/availability.service';
import {
  AvailabilityStatus,
  DateType,
  TimeSlot,
} from '../../../src/modules/availability/entities/availability.entity';
import { CreateAvailabilityDto } from '../../../src/modules/availability/dto/create-availability.dto';
import { User } from '../../../src/modules/users/entities/user.entity';

describe('AvailabilityController', () => {
  let controller: AvailabilityController;
  let service: AvailabilityService;

  const mockAvailabilityService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    findNearby: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AvailabilityController],
      providers: [
        {
          provide: AvailabilityService,
          useValue: mockAvailabilityService,
        },
      ],
    }).compile();

    controller = module.get<AvailabilityController>(AvailabilityController);
    service = module.get<AvailabilityService>(AvailabilityService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new availability', async () => {
      const user: Partial<User> = { id: 'user-123' };
      const profileId = 'profile-123';
      const dto: CreateAvailabilityDto = {
        status: AvailabilityStatus.ON,
        dateType: DateType.TODAY,
        timeSlot: TimeSlot.MORNING,
        latitude: 48.5734,
        longitude: 7.7521,
        radiusKm: 30,
      };

      const mockResult = {
        id: 'availability-123',
        profileId,
        ...dto,
      };

      mockAvailabilityService.create.mockResolvedValue(mockResult);

      const result = await controller.create(user as User, profileId, dto);

      expect(service.create).toHaveBeenCalledWith(user.id, profileId, dto);
      expect(result).toEqual(mockResult);
    });
  });

  describe('findAll', () => {
    it('should return paginated availabilities', async () => {
      const filters = {
        status: AvailabilityStatus.ON,
        dateType: DateType.TODAY,
        limit: 20,
        offset: 0,
      };

      const mockResult = {
        data: [
          {
            id: 'availability-1',
            status: AvailabilityStatus.ON,
            dateType: DateType.TODAY,
          },
        ],
        meta: {
          total: 1,
          limit: 20,
          offset: 0,
          hasMore: false,
        },
      };

      mockAvailabilityService.findAll.mockResolvedValue(mockResult);

      const result = await controller.findAll(filters);

      expect(service.findAll).toHaveBeenCalledWith(filters);
      expect(result).toEqual(mockResult);
    });
  });

  describe('findNearby', () => {
    it('should return nearby availabilities sorted by distance', async () => {
      const latitude = 48.5734;
      const longitude = 7.7521;
      const radiusKm = 30;

      const mockResult = [
        {
          id: 'availability-1',
          latitude: 48.5800,
          longitude: 7.7600,
        },
        {
          id: 'availability-2',
          latitude: 48.5700,
          longitude: 7.7500,
        },
      ];

      mockAvailabilityService.findNearby.mockResolvedValue(mockResult);

      const result = await controller.findNearby(latitude, longitude, radiusKm);

      expect(service.findNearby).toHaveBeenCalledWith(
        latitude,
        longitude,
        radiusKm,
      );
      expect(result).toEqual(mockResult);
    });

    it('should use default radius if not provided', async () => {
      const latitude = 48.5734;
      const longitude = 7.7521;

      mockAvailabilityService.findNearby.mockResolvedValue([]);

      await controller.findNearby(latitude, longitude);

      expect(service.findNearby).toHaveBeenCalledWith(latitude, longitude, 50);
    });
  });

  describe('update', () => {
    it('should update availability', async () => {
      const user: Partial<User> = { id: 'user-123' };
      const availabilityId = 'availability-123';
      const updateDto = { status: AvailabilityStatus.OFF };

      const mockResult = {
        id: availabilityId,
        status: AvailabilityStatus.OFF,
      };

      mockAvailabilityService.update.mockResolvedValue(mockResult);

      const result = await controller.update(
        availabilityId,
        user as User,
        updateDto,
      );

      expect(service.update).toHaveBeenCalledWith(
        availabilityId,
        user.id,
        updateDto,
      );
      expect(result).toEqual(mockResult);
    });
  });

  describe('remove', () => {
    it('should remove availability', async () => {
      const user: Partial<User> = { id: 'user-123' };
      const availabilityId = 'availability-123';

      mockAvailabilityService.remove.mockResolvedValue(undefined);

      await controller.remove(availabilityId, user as User);

      expect(service.remove).toHaveBeenCalledWith(availabilityId, user.id);
    });
  });
});
