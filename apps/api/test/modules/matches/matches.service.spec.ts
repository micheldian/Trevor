import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { MatchesService } from '../../../src/modules/matches/matches.service';
import {
  Match,
  MatchStatus,
} from '../../../src/modules/matches/entities/match.entity';
import {
  Job,
  JobStatus,
  JobDateType,
  JobTimeSlot,
} from '../../../src/modules/jobs/entities/job.entity';
import {
  Profile,
  ProfileType,
} from '../../../src/modules/profiles/entities/profile.entity';
import { CreateMatchDto } from '../../../src/modules/matches/dto/create-match.dto';

describe('MatchesService', () => {
  let service: MatchesService;
  let matchRepository: Repository<Match>;
  let jobRepository: Repository<Job>;
  let profileRepository: Repository<Profile>;

  const mockEmployerProfile: Profile = {
    id: 'employer-1',
    userId: 'user-1',
    type: ProfileType.EMPLOYER,
    companyName: 'Vignobles du Rhin',
    isActive: true,
    isComplete: true,
  } as Profile;

  const mockWorkerProfile: Profile = {
    id: 'worker-1',
    userId: 'user-2',
    type: ProfileType.WORKER,
    whatsappNumber: '+33612345678',
    isActive: true,
    isComplete: true,
    user: {
      id: 'user-2',
      firstName: 'Jean',
      lastName: 'Dupont',
    },
  } as Profile;

  const mockJob: Job = {
    id: 'job-1',
    employerId: 'employer-1',
    title: 'Vendanges Riesling 2024',
    culture: 'Riesling',
    dateType: JobDateType.THIS_WEEK,
    timeSlot: JobTimeSlot.DAY,
    nbPeople: 5,
    latitude: 48.5734,
    longitude: 7.7521,
    status: JobStatus.PUBLISHED,
    isActive: true,
    employer: mockEmployerProfile,
  } as Job;

  const mockMatch: Match = {
    id: 'match-1',
    jobId: 'job-1',
    candidateId: 'worker-1',
    status: MatchStatus.DISCUSSED,
    whatsappContacted: true,
    whatsappContactedAt: new Date(),
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    job: mockJob,
    candidate: mockWorkerProfile,
  } as Match;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MatchesService,
        {
          provide: getRepositoryToken(Match),
          useValue: {
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            createQueryBuilder: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Job),
          useValue: {
            findOne: jest.fn(),
            find: jest.fn(),
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

    service = module.get<MatchesService>(MatchesService);
    matchRepository = module.get<Repository<Match>>(getRepositoryToken(Match));
    jobRepository = module.get<Repository<Job>>(getRepositoryToken(Job));
    profileRepository = module.get<Repository<Profile>>(
      getRepositoryToken(Profile),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createMatch', () => {
    const createMatchDto: CreateMatchDto = {
      jobId: 'job-1',
      candidateId: 'worker-1',
      employerNotes: 'Profil intéressant',
    };

    it('should create a new match and generate WhatsApp link', async () => {
      jest.spyOn(jobRepository, 'findOne').mockResolvedValue(mockJob);
      jest
        .spyOn(profileRepository, 'findOne')
        .mockResolvedValueOnce(mockEmployerProfile) // Employer check
        .mockResolvedValueOnce(mockWorkerProfile); // Candidate check

      // No existing match (anti-duplication)
      jest
        .spyOn(matchRepository, 'findOne')
        .mockResolvedValueOnce(null) // First check (no existing)
        .mockResolvedValueOnce(mockMatch); // After save (with relations)

      jest.spyOn(matchRepository, 'create').mockReturnValue(mockMatch);
      jest.spyOn(matchRepository, 'save').mockResolvedValue(mockMatch);

      const result = await service.createMatch('user-1', createMatchDto);

      expect(result).toBeDefined();
      expect(result.match).toEqual(mockMatch);
      expect(result.whatsappLink).toContain('wa.me');
      expect(result.whatsappLink).toContain('33612345678');
      expect(result.candidatePhone).toBe('+33612345678');
      expect(result.isNewMatch).toBe(true);
    });

    it('should return existing match if already created (anti-duplication)', async () => {
      jest.spyOn(jobRepository, 'findOne').mockResolvedValue(mockJob);
      jest
        .spyOn(profileRepository, 'findOne')
        .mockResolvedValueOnce(mockEmployerProfile)
        .mockResolvedValueOnce(mockWorkerProfile);

      // Existing match found
      jest.spyOn(matchRepository, 'findOne').mockResolvedValue(mockMatch);
      jest.spyOn(matchRepository, 'save').mockResolvedValue(mockMatch);

      const result = await service.createMatch('user-1', createMatchDto);

      expect(result.match).toEqual(mockMatch);
      expect(result.isNewMatch).toBe(false);
      expect(matchRepository.create).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException if job not found', async () => {
      jest.spyOn(jobRepository, 'findOne').mockResolvedValue(null);

      await expect(
        service.createMatch('user-1', createMatchDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if user is not job owner', async () => {
      jest.spyOn(jobRepository, 'findOne').mockResolvedValue(mockJob);
      jest.spyOn(profileRepository, 'findOne').mockResolvedValueOnce({
        ...mockEmployerProfile,
        userId: 'different-user',
      });

      await expect(
        service.createMatch('wrong-user', createMatchDto),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException if candidate not found', async () => {
      jest.spyOn(jobRepository, 'findOne').mockResolvedValue(mockJob);
      jest
        .spyOn(profileRepository, 'findOne')
        .mockResolvedValueOnce(mockEmployerProfile)
        .mockResolvedValueOnce(null); // Candidate not found

      await expect(
        service.createMatch('user-1', createMatchDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if candidate is not worker/team_lead', async () => {
      jest.spyOn(jobRepository, 'findOne').mockResolvedValue(mockJob);
      jest
        .spyOn(profileRepository, 'findOne')
        .mockResolvedValueOnce(mockEmployerProfile)
        .mockResolvedValueOnce({
          ...mockWorkerProfile,
          type: ProfileType.EMPLOYER, // Wrong type
        });

      await expect(
        service.createMatch('user-1', createMatchDto),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if candidate has no WhatsApp number', async () => {
      jest.spyOn(jobRepository, 'findOne').mockResolvedValue(mockJob);
      jest
        .spyOn(profileRepository, 'findOne')
        .mockResolvedValueOnce(mockEmployerProfile)
        .mockResolvedValueOnce({
          ...mockWorkerProfile,
          whatsappNumber: undefined, // No WhatsApp
        });

      await expect(
        service.createMatch('user-1', createMatchDto),
      ).rejects.toThrow(BadRequestException);
    });

    it('should update whatsappContacted if existing match not contacted', async () => {
      const existingMatch = {
        ...mockMatch,
        whatsappContacted: false,
        whatsappContactedAt: undefined,
      };

      jest.spyOn(jobRepository, 'findOne').mockResolvedValue(mockJob);
      jest
        .spyOn(profileRepository, 'findOne')
        .mockResolvedValueOnce(mockEmployerProfile)
        .mockResolvedValueOnce(mockWorkerProfile);

      jest.spyOn(matchRepository, 'findOne').mockResolvedValue(existingMatch);
      jest.spyOn(matchRepository, 'save').mockResolvedValue({
        ...existingMatch,
        whatsappContacted: true,
        whatsappContactedAt: new Date(),
      });

      const result = await service.createMatch('user-1', createMatchDto);

      expect(matchRepository.save).toHaveBeenCalled();
      expect(result.match.whatsappContacted).toBe(true);
    });

    it('should generate correct WhatsApp link format', async () => {
      jest.spyOn(jobRepository, 'findOne').mockResolvedValue(mockJob);
      jest
        .spyOn(profileRepository, 'findOne')
        .mockResolvedValueOnce(mockEmployerProfile)
        .mockResolvedValueOnce(mockWorkerProfile);

      jest
        .spyOn(matchRepository, 'findOne')
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(mockMatch);

      jest.spyOn(matchRepository, 'create').mockReturnValue(mockMatch);
      jest.spyOn(matchRepository, 'save').mockResolvedValue(mockMatch);

      const result = await service.createMatch('user-1', createMatchDto);

      expect(result.whatsappLink).toMatch(/^https:\/\/wa\.me\//);
      expect(result.whatsappLink).toContain('text=');
      expect(result.whatsappLink).toContain(
        encodeURIComponent('Vendanges Riesling 2024'),
      );
    });
  });

  describe('findAll', () => {
    it('should return all active matches', async () => {
      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([mockMatch]),
      };

      jest
        .spyOn(matchRepository, 'createQueryBuilder')
        .mockReturnValue(mockQueryBuilder as any);

      const result = await service.findAll();

      expect(result).toHaveLength(1);
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'match.isActive = :isActive',
        { isActive: true },
      );
    });

    it('should filter by jobId', async () => {
      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([mockMatch]),
      };

      jest
        .spyOn(matchRepository, 'createQueryBuilder')
        .mockReturnValue(mockQueryBuilder as any);

      await service.findAll({ jobId: 'job-1' });

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'match.jobId = :jobId',
        { jobId: 'job-1' },
      );
    });
  });

  describe('findOne', () => {
    it('should return a match by id', async () => {
      jest.spyOn(matchRepository, 'findOne').mockResolvedValue(mockMatch);

      const result = await service.findOne('match-1');

      expect(result).toEqual(mockMatch);
    });

    it('should throw NotFoundException if match not found', async () => {
      jest.spyOn(matchRepository, 'findOne').mockResolvedValue(null);

      await expect(service.findOne('invalid-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateStatus', () => {
    it('should update status by employer', async () => {
      jest.spyOn(matchRepository, 'findOne').mockResolvedValue(mockMatch);
      jest
        .spyOn(profileRepository, 'findOne')
        .mockResolvedValueOnce(mockEmployerProfile) // Employer check
        .mockResolvedValueOnce(mockWorkerProfile); // Candidate check

      jest.spyOn(matchRepository, 'save').mockResolvedValue({
        ...mockMatch,
        status: MatchStatus.CONFIRMED,
        confirmedAt: new Date(),
      });

      const result = await service.updateStatus('user-1', 'match-1', {
        status: MatchStatus.CONFIRMED,
        notes: 'Mission confirmée',
      });

      expect(result.status).toBe(MatchStatus.CONFIRMED);
      expect(result.confirmedAt).toBeDefined();
      expect(matchRepository.save).toHaveBeenCalled();
    });

    it('should update status by candidate', async () => {
      jest.spyOn(matchRepository, 'findOne').mockResolvedValue(mockMatch);
      jest
        .spyOn(profileRepository, 'findOne')
        .mockResolvedValueOnce(mockEmployerProfile)
        .mockResolvedValueOnce(mockWorkerProfile);

      jest.spyOn(matchRepository, 'save').mockResolvedValue({
        ...mockMatch,
        status: MatchStatus.INTERESTED,
        interestedAt: new Date(),
      });

      const result = await service.updateStatus('user-2', 'match-1', {
        status: MatchStatus.INTERESTED,
        notes: 'Intéressé par cette mission',
      });

      expect(result.status).toBe(MatchStatus.INTERESTED);
      expect(result.interestedAt).toBeDefined();
    });

    it('should throw ForbiddenException if user is neither employer nor candidate', async () => {
      jest.spyOn(matchRepository, 'findOne').mockResolvedValue(mockMatch);
      jest
        .spyOn(profileRepository, 'findOne')
        .mockResolvedValueOnce(mockEmployerProfile)
        .mockResolvedValueOnce(mockWorkerProfile);

      await expect(
        service.updateStatus('random-user', 'match-1', {
          status: MatchStatus.CONFIRMED,
        }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should add employer notes when employer updates', async () => {
      jest.spyOn(matchRepository, 'findOne').mockResolvedValue(mockMatch);
      jest
        .spyOn(profileRepository, 'findOne')
        .mockResolvedValueOnce(mockEmployerProfile)
        .mockResolvedValueOnce(mockWorkerProfile);

      const saveMock = jest.spyOn(matchRepository, 'save');

      await service.updateStatus('user-1', 'match-1', {
        status: MatchStatus.CONFIRMED,
        notes: 'Notes employeur',
      });

      expect(saveMock).toHaveBeenCalledWith(
        expect.objectContaining({
          employerNotes: 'Notes employeur',
        }),
      );
    });

    it('should add candidate notes when candidate updates', async () => {
      jest.spyOn(matchRepository, 'findOne').mockResolvedValue(mockMatch);
      jest
        .spyOn(profileRepository, 'findOne')
        .mockResolvedValueOnce(mockEmployerProfile)
        .mockResolvedValueOnce(mockWorkerProfile);

      const saveMock = jest.spyOn(matchRepository, 'save');

      await service.updateStatus('user-2', 'match-1', {
        status: MatchStatus.INTERESTED,
        notes: 'Notes candidat',
      });

      expect(saveMock).toHaveBeenCalledWith(
        expect.objectContaining({
          candidateNotes: 'Notes candidat',
        }),
      );
    });
  });

  describe('findByEmployer', () => {
    it('should return matches for employer jobs', async () => {
      jest
        .spyOn(profileRepository, 'findOne')
        .mockResolvedValue(mockEmployerProfile);
      jest.spyOn(jobRepository, 'find').mockResolvedValue([mockJob]);

      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([mockMatch]),
      };

      jest
        .spyOn(matchRepository, 'createQueryBuilder')
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

    it('should return empty array if employer has no jobs', async () => {
      jest
        .spyOn(profileRepository, 'findOne')
        .mockResolvedValue(mockEmployerProfile);
      jest.spyOn(jobRepository, 'find').mockResolvedValue([]);

      const result = await service.findByEmployer('user-1', 'employer-1');

      expect(result).toEqual([]);
    });
  });

  describe('findByCandidate', () => {
    it('should return matches for a candidate', async () => {
      jest
        .spyOn(profileRepository, 'findOne')
        .mockResolvedValue(mockWorkerProfile);

      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([mockMatch]),
      };

      jest
        .spyOn(matchRepository, 'createQueryBuilder')
        .mockReturnValue(mockQueryBuilder as any);

      const result = await service.findByCandidate('user-2', 'worker-1');

      expect(result).toHaveLength(1);
      expect(profileRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'worker-1', userId: 'user-2' },
      });
    });

    it('should throw NotFoundException if candidate profile not found', async () => {
      jest.spyOn(profileRepository, 'findOne').mockResolvedValue(null);

      await expect(
        service.findByCandidate('user-2', 'worker-1'),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
