import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { JobsService } from '../../../src/modules/jobs/jobs.service';
import {
  Job,
  JobStatus,
  JobDateType,
  JobTimeSlot,
} from '../../../src/modules/jobs/entities/job.entity';
import { Profile, ProfileType } from '../../../src/modules/profiles/entities/profile.entity';
import { CreateJobDto } from '../../../src/modules/jobs/dto/create-job.dto';
import { TransitionJobStatusDto } from '../../../src/modules/jobs/dto/transition-job-status.dto';

describe('JobsService', () => {
  let service: JobsService;
  let jobRepository: Repository<Job>;
  let profileRepository: Repository<Profile>;

  const mockEmployerProfile: Profile = {
    id: 'employer-1',
    userId: 'user-1',
    type: ProfileType.EMPLOYER,
    companyName: 'Vignobles du Rhin',
    siret: '12345678901234',
    isActive: true,
    isComplete: true,
  } as Profile;

  const mockWorkerProfile: Profile = {
    id: 'worker-1',
    userId: 'user-2',
    type: ProfileType.WORKER,
    isActive: true,
    isComplete: true,
  } as Profile;

  const mockJob: Job = {
    id: 'job-1',
    employerId: 'employer-1',
    title: 'Vendanges Riesling 2024',
    description: 'Recherche 5 personnes pour vendanges',
    culture: 'Riesling',
    tags: ['vendanges', 'urgent'],
    requiredSkills: ['viticulture'],
    dateType: JobDateType.THIS_WEEK,
    specificDate: undefined,
    timeSlot: JobTimeSlot.DAY,
    nbPeople: 5,
    latitude: 48.5734,
    longitude: 7.7521,
    address: '15 Route des Vins',
    city: 'Barr',
    postalCode: '67140',
    status: JobStatus.DRAFT,
    hourlyRate: 12.5,
    estimatedHours: 8,
    isUrgent: true,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    employer: mockEmployerProfile,
  } as Job;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JobsService,
        {
          provide: getRepositoryToken(Job),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
            createQueryBuilder: jest.fn(),
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

    service = module.get<JobsService>(JobsService);
    jobRepository = module.get<Repository<Job>>(getRepositoryToken(Job));
    profileRepository = module.get<Repository<Profile>>(
      getRepositoryToken(Profile),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createJobDto: CreateJobDto = {
      title: 'Vendanges Riesling 2024',
      description: 'Recherche 5 personnes',
      culture: 'Riesling',
      tags: ['vendanges'],
      requiredSkills: ['viticulture'],
      dateType: JobDateType.THIS_WEEK,
      timeSlot: JobTimeSlot.DAY,
      nbPeople: 5,
      latitude: 48.5734,
      longitude: 7.7521,
      city: 'Barr',
      postalCode: '67140',
      isUrgent: true,
    };

    it('should create a job for an employer', async () => {
      jest
        .spyOn(profileRepository, 'findOne')
        .mockResolvedValue(mockEmployerProfile);
      jest.spyOn(jobRepository, 'create').mockReturnValue(mockJob);
      jest.spyOn(jobRepository, 'save').mockResolvedValue(mockJob);

      const result = await service.create('user-1', 'employer-1', createJobDto);

      expect(result).toBeDefined();
      expect(result.status).toBe(JobStatus.DRAFT);
      expect(profileRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'employer-1', userId: 'user-1' },
      });
      expect(jobRepository.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException if employer profile not found', async () => {
      jest.spyOn(profileRepository, 'findOne').mockResolvedValue(null);

      await expect(
        service.create('user-1', 'employer-1', createJobDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if profile is not an employer', async () => {
      jest
        .spyOn(profileRepository, 'findOne')
        .mockResolvedValue(mockWorkerProfile);

      await expect(
        service.create('user-2', 'worker-1', createJobDto),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw BadRequestException if specific_date missing when required', async () => {
      jest
        .spyOn(profileRepository, 'findOne')
        .mockResolvedValue(mockEmployerProfile);

      const dtoWithoutDate: CreateJobDto = {
        ...createJobDto,
        dateType: JobDateType.SPECIFIC_DATE,
        specificDate: undefined,
      };

      await expect(
        service.create('user-1', 'employer-1', dtoWithoutDate),
      ).rejects.toThrow(BadRequestException);
    });

    it('should set default values for tags and requiredSkills', async () => {
      jest
        .spyOn(profileRepository, 'findOne')
        .mockResolvedValue(mockEmployerProfile);
      jest.spyOn(jobRepository, 'create').mockReturnValue(mockJob);
      jest.spyOn(jobRepository, 'save').mockResolvedValue(mockJob);

      const dtoWithoutArrays: CreateJobDto = {
        ...createJobDto,
        tags: undefined,
        requiredSkills: undefined,
      };

      await service.create('user-1', 'employer-1', dtoWithoutArrays);

      expect(jobRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          tags: [],
          requiredSkills: [],
        }),
      );
    });
  });

  describe('findAll', () => {
    it('should return all active jobs without filters', async () => {
      const mockQueryBuilder = {
        createQueryBuilder: jest.fn().mockReturnThis(),
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([mockJob]),
      };

      jest
        .spyOn(jobRepository, 'createQueryBuilder')
        .mockReturnValue(mockQueryBuilder as any);

      const result = await service.findAll();

      expect(result).toHaveLength(1);
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'job.isActive = :isActive',
        { isActive: true },
      );
    });

    it('should filter by status', async () => {
      const mockQueryBuilder = {
        createQueryBuilder: jest.fn().mockReturnThis(),
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([mockJob]),
      };

      jest
        .spyOn(jobRepository, 'createQueryBuilder')
        .mockReturnValue(mockQueryBuilder as any);

      await service.findAll({ status: JobStatus.PUBLISHED });

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'job.status = :status',
        { status: JobStatus.PUBLISHED },
      );
    });
  });

  describe('findOne', () => {
    it('should return a job by id', async () => {
      jest.spyOn(jobRepository, 'findOne').mockResolvedValue(mockJob);

      const result = await service.findOne('job-1');

      expect(result).toEqual(mockJob);
      expect(jobRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'job-1', isActive: true },
        relations: ['employer', 'employer.user'],
      });
    });

    it('should throw NotFoundException if job not found', async () => {
      jest.spyOn(jobRepository, 'findOne').mockResolvedValue(null);

      await expect(service.findOne('invalid-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update a job', async () => {
      jest.spyOn(jobRepository, 'findOne').mockResolvedValue(mockJob);
      jest
        .spyOn(profileRepository, 'findOne')
        .mockResolvedValue(mockEmployerProfile);
      jest
        .spyOn(jobRepository, 'save')
        .mockResolvedValue({ ...mockJob, title: 'Updated Title' });

      const result = await service.update('user-1', 'job-1', {
        title: 'Updated Title',
      });

      expect(result.title).toBe('Updated Title');
      expect(jobRepository.save).toHaveBeenCalled();
    });

    it('should throw ForbiddenException if user is not the owner', async () => {
      jest.spyOn(jobRepository, 'findOne').mockResolvedValue(mockJob);
      jest.spyOn(profileRepository, 'findOne').mockResolvedValue({
        ...mockEmployerProfile,
        userId: 'different-user',
      });

      await expect(
        service.update('wrong-user', 'job-1', { title: 'New Title' }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw BadRequestException if job is confirmed', async () => {
      jest.spyOn(jobRepository, 'findOne').mockResolvedValue({
        ...mockJob,
        status: JobStatus.CONFIRMED,
      });
      jest
        .spyOn(profileRepository, 'findOne')
        .mockResolvedValue(mockEmployerProfile);

      await expect(
        service.update('user-1', 'job-1', { title: 'New Title' }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('remove', () => {
    it('should soft delete a draft job', async () => {
      jest.spyOn(jobRepository, 'findOne').mockResolvedValue(mockJob);
      jest
        .spyOn(profileRepository, 'findOne')
        .mockResolvedValue(mockEmployerProfile);
      jest
        .spyOn(jobRepository, 'save')
        .mockResolvedValue({ ...mockJob, isActive: false });

      await service.remove('user-1', 'job-1');

      expect(jobRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ isActive: false }),
      );
    });

    it('should throw BadRequestException if job is confirmed', async () => {
      jest.spyOn(jobRepository, 'findOne').mockResolvedValue({
        ...mockJob,
        status: JobStatus.CONFIRMED,
      });
      jest
        .spyOn(profileRepository, 'findOne')
        .mockResolvedValue(mockEmployerProfile);

      await expect(service.remove('user-1', 'job-1')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('transitionStatus', () => {
    it('should transition from draft to published', async () => {
      jest.spyOn(jobRepository, 'findOne').mockResolvedValue(mockJob);
      jest
        .spyOn(profileRepository, 'findOne')
        .mockResolvedValue(mockEmployerProfile);
      jest.spyOn(jobRepository, 'save').mockResolvedValue({
        ...mockJob,
        status: JobStatus.PUBLISHED,
        publishedAt: new Date(),
      });

      const dto: TransitionJobStatusDto = { status: JobStatus.PUBLISHED };
      const result = await service.transitionStatus('user-1', 'job-1', dto);

      expect(result.status).toBe(JobStatus.PUBLISHED);
      expect(result.publishedAt).toBeDefined();
    });

    it('should throw BadRequestException if transition not allowed', async () => {
      jest.spyOn(jobRepository, 'findOne').mockResolvedValue({
        ...mockJob,
        status: JobStatus.COMPLETED,
      });
      jest
        .spyOn(profileRepository, 'findOne')
        .mockResolvedValue(mockEmployerProfile);

      const dto: TransitionJobStatusDto = { status: JobStatus.DRAFT };

      await expect(
        service.transitionStatus('user-1', 'job-1', dto),
      ).rejects.toThrow(BadRequestException);
    });

    it('should require reason for cancellation', async () => {
      jest.spyOn(jobRepository, 'findOne').mockResolvedValue(mockJob);
      jest
        .spyOn(profileRepository, 'findOne')
        .mockResolvedValue(mockEmployerProfile);

      const dto: TransitionJobStatusDto = { status: JobStatus.CANCELLED };

      await expect(
        service.transitionStatus('user-1', 'job-1', dto),
      ).rejects.toThrow(BadRequestException);
    });

    it('should cancel with reason', async () => {
      jest.spyOn(jobRepository, 'findOne').mockResolvedValue(mockJob);
      jest
        .spyOn(profileRepository, 'findOne')
        .mockResolvedValue(mockEmployerProfile);
      jest.spyOn(jobRepository, 'save').mockResolvedValue({
        ...mockJob,
        status: JobStatus.CANCELLED,
        cancelledAt: new Date(),
        cancellationReason: 'Pas assez de candidats',
      });

      const dto: TransitionJobStatusDto = {
        status: JobStatus.CANCELLED,
        reason: 'Pas assez de candidats',
      };

      const result = await service.transitionStatus('user-1', 'job-1', dto);

      expect(result.status).toBe(JobStatus.CANCELLED);
      expect(result.cancellationReason).toBe('Pas assez de candidats');
    });

    it('should throw BadRequestException if status unchanged', async () => {
      jest.spyOn(jobRepository, 'findOne').mockResolvedValue(mockJob);
      jest
        .spyOn(profileRepository, 'findOne')
        .mockResolvedValue(mockEmployerProfile);

      const dto: TransitionJobStatusDto = { status: JobStatus.DRAFT };

      await expect(
        service.transitionStatus('user-1', 'job-1', dto),
      ).rejects.toThrow(BadRequestException);
    });

    it('should validate publishing requirements', async () => {
      const incompleteJob = {
        ...mockJob,
        title: 'abc', // Too short
      };

      jest.spyOn(jobRepository, 'findOne').mockResolvedValue(incompleteJob);
      jest
        .spyOn(profileRepository, 'findOne')
        .mockResolvedValue(mockEmployerProfile);

      const dto: TransitionJobStatusDto = { status: JobStatus.PUBLISHED };

      await expect(
        service.transitionStatus('user-1', 'job-1', dto),
      ).rejects.toThrow(BadRequestException);
    });

    it('should validate future date for specific_date when publishing', async () => {
      const pastDateJob = {
        ...mockJob,
        dateType: JobDateType.SPECIFIC_DATE,
        specificDate: new Date('2020-01-01'),
      };

      jest.spyOn(jobRepository, 'findOne').mockResolvedValue(pastDateJob);
      jest
        .spyOn(profileRepository, 'findOne')
        .mockResolvedValue(mockEmployerProfile);

      const dto: TransitionJobStatusDto = { status: JobStatus.PUBLISHED };

      await expect(
        service.transitionStatus('user-1', 'job-1', dto),
      ).rejects.toThrow(BadRequestException);
    });

    it('should allow transition from published to in_contact', async () => {
      jest.spyOn(jobRepository, 'findOne').mockResolvedValue({
        ...mockJob,
        status: JobStatus.PUBLISHED,
      });
      jest
        .spyOn(profileRepository, 'findOne')
        .mockResolvedValue(mockEmployerProfile);
      jest.spyOn(jobRepository, 'save').mockResolvedValue({
        ...mockJob,
        status: JobStatus.IN_CONTACT,
      });

      const dto: TransitionJobStatusDto = { status: JobStatus.IN_CONTACT };
      const result = await service.transitionStatus('user-1', 'job-1', dto);

      expect(result.status).toBe(JobStatus.IN_CONTACT);
    });

    it('should allow transition from in_contact to confirmed', async () => {
      jest.spyOn(jobRepository, 'findOne').mockResolvedValue({
        ...mockJob,
        status: JobStatus.IN_CONTACT,
      });
      jest
        .spyOn(profileRepository, 'findOne')
        .mockResolvedValue(mockEmployerProfile);
      jest.spyOn(jobRepository, 'save').mockResolvedValue({
        ...mockJob,
        status: JobStatus.CONFIRMED,
        confirmedAt: new Date(),
      });

      const dto: TransitionJobStatusDto = { status: JobStatus.CONFIRMED };
      const result = await service.transitionStatus('user-1', 'job-1', dto);

      expect(result.status).toBe(JobStatus.CONFIRMED);
      expect(result.confirmedAt).toBeDefined();
    });

    it('should allow transition from confirmed to completed', async () => {
      jest.spyOn(jobRepository, 'findOne').mockResolvedValue({
        ...mockJob,
        status: JobStatus.CONFIRMED,
      });
      jest
        .spyOn(profileRepository, 'findOne')
        .mockResolvedValue(mockEmployerProfile);
      jest.spyOn(jobRepository, 'save').mockResolvedValue({
        ...mockJob,
        status: JobStatus.COMPLETED,
        completedAt: new Date(),
      });

      const dto: TransitionJobStatusDto = { status: JobStatus.COMPLETED };
      const result = await service.transitionStatus('user-1', 'job-1', dto);

      expect(result.status).toBe(JobStatus.COMPLETED);
      expect(result.completedAt).toBeDefined();
    });
  });

  describe('findByEmployer', () => {
    it('should return jobs for a specific employer', async () => {
      jest
        .spyOn(profileRepository, 'findOne')
        .mockResolvedValue(mockEmployerProfile);

      const mockQueryBuilder = {
        createQueryBuilder: jest.fn().mockReturnThis(),
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([mockJob]),
      };

      jest
        .spyOn(jobRepository, 'createQueryBuilder')
        .mockReturnValue(mockQueryBuilder as any);

      const result = await service.findByEmployer('user-1', 'employer-1');

      expect(result).toHaveLength(1);
      expect(profileRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'employer-1', userId: 'user-1' },
      });
    });

    it('should throw NotFoundException if employer profile not found', async () => {
      jest.spyOn(profileRepository, 'findOne').mockResolvedValue(null);

      await expect(
        service.findByEmployer('user-1', 'employer-1'),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
