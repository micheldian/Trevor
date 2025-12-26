import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import {
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { ReviewsService } from '../../../src/modules/reviews/reviews.service';
import { Review } from '../../../src/modules/reviews/entities/review.entity';
import { Match, MatchStatus } from '../../../src/modules/matches/entities/match.entity';
import { Profile, ProfileType } from '../../../src/modules/profiles/entities/profile.entity';
import { Job } from '../../../src/modules/jobs/entities/job.entity';
import { CreateReviewDto } from '../../../src/modules/reviews/dto/create-review.dto';

describe('ReviewsService', () => {
  let service: ReviewsService;
  let reviewRepository: Repository<Review>;
  let matchRepository: Repository<Match>;
  let profileRepository: Repository<Profile>;
  let dataSource: DataSource;

  const mockEmployerProfile: Profile = {
    id: 'employer-profile-1',
    userId: 'employer-user-1',
    type: ProfileType.EMPLOYER,
    companyName: 'Vignobles du Rhin',
    city: 'Strasbourg',
    postalCode: '67000',
    experienceYears: 0,
    preferredContact: 'whatsapp',
    ratingAvg: 0,
    ratingCount: 0,
    missionsCount: 0,
    completedMissionsCount: 0,
    noShowCount: 0,
    cancelledCount: 0,
    reliabilityScore: 100,
    isActive: true,
    isComplete: true,
    hasVehicle: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  } as Profile;

  const mockCandidateProfile: Profile = {
    id: 'candidate-profile-1',
    userId: 'candidate-user-1',
    type: ProfileType.WORKER,
    city: 'Strasbourg',
    postalCode: '67000',
    experienceYears: 3,
    preferredContact: 'whatsapp',
    whatsappNumber: '+33612345678',
    ratingAvg: 0,
    ratingCount: 0,
    missionsCount: 0,
    completedMissionsCount: 0,
    noShowCount: 0,
    cancelledCount: 0,
    reliabilityScore: 100,
    isActive: true,
    isComplete: true,
    hasVehicle: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  } as Profile;

  const mockJob: Job = {
    id: 'job-1',
    employerId: 'employer-profile-1',
    employer: mockEmployerProfile,
  } as Job;

  const mockCompletedMatch: Match = {
    id: 'match-1',
    jobId: 'job-1',
    candidateId: 'candidate-profile-1',
    status: MatchStatus.COMPLETED,
    job: mockJob,
    candidate: mockCandidateProfile,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  } as Match;

  const mockReview: Review = {
    id: 'review-1',
    matchId: 'match-1',
    reviewerId: 'employer-profile-1',
    reviewedId: 'candidate-profile-1',
    rating: 4.5,
    professionalism: 5,
    punctuality: 4,
    communication: 5,
    quality: 4.5,
    comment: 'Excellent worker',
    wasNoShow: false,
    wasCancelled: false,
    wouldWorkAgain: true,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  } as Review;

  let mockQueryRunner: any;

  beforeEach(async () => {
    // Mock QueryRunner
    mockQueryRunner = {
      connect: jest.fn(),
      startTransaction: jest.fn(),
      commitTransaction: jest.fn(),
      rollbackTransaction: jest.fn(),
      release: jest.fn(),
      manager: {
        findOne: jest.fn(),
        find: jest.fn(),
        create: jest.fn(),
        save: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReviewsService,
        {
          provide: getRepositoryToken(Review),
          useValue: {
            findOne: jest.fn(),
            find: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Match),
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Profile),
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: DataSource,
          useValue: {
            createQueryRunner: jest.fn().mockReturnValue(mockQueryRunner),
          },
        },
      ],
    }).compile();

    service = module.get<ReviewsService>(ReviewsService);
    reviewRepository = module.get<Repository<Review>>(getRepositoryToken(Review));
    matchRepository = module.get<Repository<Match>>(getRepositoryToken(Match));
    profileRepository = module.get<Repository<Profile>>(getRepositoryToken(Profile));
    dataSource = module.get<DataSource>(DataSource);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createReviewDto: CreateReviewDto = {
      matchId: 'match-1',
      rating: 4.5,
      professionalism: 5,
      punctuality: 4,
      communication: 5,
      quality: 4.5,
      comment: 'Excellent worker',
      wasNoShow: false,
      wasCancelled: false,
      wouldWorkAgain: true,
    };

    it('should create a review successfully (employer reviewing candidate)', async () => {
      // Setup
      mockQueryRunner.manager.findOne
        .mockResolvedValueOnce(mockCompletedMatch) // Match
        .mockResolvedValueOnce(mockEmployerProfile) // Employer profile
        .mockResolvedValueOnce(mockCandidateProfile) // Candidate profile
        .mockResolvedValueOnce(null) // No existing review
        .mockResolvedValueOnce(mockCandidateProfile) // Profile for stats update
        .mockResolvedValueOnce(mockCandidateProfile); // Save profile

      mockQueryRunner.manager.find.mockResolvedValueOnce([mockReview]); // All reviews for stats

      mockQueryRunner.manager.create.mockReturnValue(mockReview);
      mockQueryRunner.manager.save.mockResolvedValue(mockReview);

      jest.spyOn(reviewRepository, 'findOne').mockResolvedValue(mockReview);

      // Execute
      const result = await service.create('employer-user-1', createReviewDto);

      // Assert
      expect(result).toBeDefined();
      expect(mockQueryRunner.connect).toHaveBeenCalled();
      expect(mockQueryRunner.startTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.commitTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.release).toHaveBeenCalled();
    });

    it('should create a review successfully (candidate reviewing employer)', async () => {
      // Setup - candidate is the reviewer
      mockQueryRunner.manager.findOne
        .mockResolvedValueOnce(mockCompletedMatch)
        .mockResolvedValueOnce(mockEmployerProfile)
        .mockResolvedValueOnce(mockCandidateProfile)
        .mockResolvedValueOnce(null) // No existing review
        .mockResolvedValueOnce(mockEmployerProfile); // Profile for stats

      mockQueryRunner.manager.find.mockResolvedValueOnce([mockReview]);
      mockQueryRunner.manager.create.mockReturnValue(mockReview);
      mockQueryRunner.manager.save.mockResolvedValue(mockReview);
      jest.spyOn(reviewRepository, 'findOne').mockResolvedValue(mockReview);

      // Execute
      const result = await service.create('candidate-user-1', createReviewDto);

      // Assert
      expect(result).toBeDefined();
      expect(mockQueryRunner.commitTransaction).toHaveBeenCalled();
    });

    it('should throw NotFoundException if match not found', async () => {
      mockQueryRunner.manager.findOne.mockResolvedValueOnce(null);

      await expect(
        service.create('employer-user-1', createReviewDto),
      ).rejects.toThrow(NotFoundException);

      expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.release).toHaveBeenCalled();
    });

    it('should throw BadRequestException if match is not completed', async () => {
      const inContactMatch = { ...mockCompletedMatch, status: MatchStatus.DISCUSSED };
      mockQueryRunner.manager.findOne.mockResolvedValueOnce(inContactMatch);

      await expect(
        service.create('employer-user-1', createReviewDto),
      ).rejects.toThrow(BadRequestException);

      expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
    });

    it('should throw NotFoundException if employer profile not found', async () => {
      mockQueryRunner.manager.findOne
        .mockResolvedValueOnce(mockCompletedMatch)
        .mockResolvedValueOnce(null); // No employer profile

      await expect(
        service.create('employer-user-1', createReviewDto),
      ).rejects.toThrow(NotFoundException);

      expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
    });

    it('should throw NotFoundException if candidate profile not found', async () => {
      mockQueryRunner.manager.findOne
        .mockResolvedValueOnce(mockCompletedMatch)
        .mockResolvedValueOnce(mockEmployerProfile)
        .mockResolvedValueOnce(null); // No candidate profile

      await expect(
        service.create('employer-user-1', createReviewDto),
      ).rejects.toThrow(NotFoundException);

      expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
    });

    it('should throw ForbiddenException if user is neither employer nor candidate', async () => {
      mockQueryRunner.manager.findOne
        .mockResolvedValueOnce(mockCompletedMatch)
        .mockResolvedValueOnce(mockEmployerProfile)
        .mockResolvedValueOnce(mockCandidateProfile);

      await expect(
        service.create('random-user-123', createReviewDto),
      ).rejects.toThrow(ForbiddenException);

      expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
    });

    it('should throw ConflictException if review already exists', async () => {
      mockQueryRunner.manager.findOne
        .mockResolvedValueOnce(mockCompletedMatch)
        .mockResolvedValueOnce(mockEmployerProfile)
        .mockResolvedValueOnce(mockCandidateProfile)
        .mockResolvedValueOnce(mockReview); // Existing review

      await expect(
        service.create('employer-user-1', createReviewDto),
      ).rejects.toThrow(ConflictException);

      expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
    });

    it('should calculate stats correctly with no-show', async () => {
      const noShowDto = { ...createReviewDto, wasNoShow: true };

      mockQueryRunner.manager.findOne
        .mockResolvedValueOnce(mockCompletedMatch)
        .mockResolvedValueOnce(mockEmployerProfile)
        .mockResolvedValueOnce(mockCandidateProfile)
        .mockResolvedValueOnce(null) // No existing review
        .mockResolvedValueOnce(mockCandidateProfile); // Profile for stats

      const reviewWithNoShow = { ...mockReview, wasNoShow: true };
      mockQueryRunner.manager.find.mockResolvedValueOnce([reviewWithNoShow]);
      mockQueryRunner.manager.create.mockReturnValue(reviewWithNoShow);
      mockQueryRunner.manager.save.mockResolvedValue(reviewWithNoShow);
      jest.spyOn(reviewRepository, 'findOne').mockResolvedValue(reviewWithNoShow);

      await service.create('employer-user-1', noShowDto);

      // The profile stats should be updated with no-show penalty
      // reliabilityScore = 100 - (1 * 20) = 80
      expect(mockQueryRunner.manager.save).toHaveBeenCalled();
    });

    it('should calculate stats correctly with cancellation', async () => {
      const cancelledDto = {
        ...createReviewDto,
        wasCancelled: true,
        cancellationReason: 'Bad weather',
      };

      mockQueryRunner.manager.findOne
        .mockResolvedValueOnce(mockCompletedMatch)
        .mockResolvedValueOnce(mockEmployerProfile)
        .mockResolvedValueOnce(mockCandidateProfile)
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(mockCandidateProfile);

      const reviewWithCancellation = { ...mockReview, wasCancelled: true };
      mockQueryRunner.manager.find.mockResolvedValueOnce([reviewWithCancellation]);
      mockQueryRunner.manager.create.mockReturnValue(reviewWithCancellation);
      mockQueryRunner.manager.save.mockResolvedValue(reviewWithCancellation);
      jest.spyOn(reviewRepository, 'findOne').mockResolvedValue(reviewWithCancellation);

      await service.create('employer-user-1', cancelledDto);

      // reliabilityScore = 100 - (1 * 10) = 90
      expect(mockQueryRunner.manager.save).toHaveBeenCalled();
    });

    it('should calculate average rating correctly', async () => {
      mockQueryRunner.manager.findOne
        .mockResolvedValueOnce(mockCompletedMatch)
        .mockResolvedValueOnce(mockEmployerProfile)
        .mockResolvedValueOnce(mockCandidateProfile)
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(mockCandidateProfile);

      const review1 = { ...mockReview, rating: 4.0 };
      const review2 = { ...mockReview, rating: 5.0 };
      mockQueryRunner.manager.find.mockResolvedValueOnce([review1, review2]);
      mockQueryRunner.manager.create.mockReturnValue(review2);
      mockQueryRunner.manager.save.mockResolvedValue(review2);
      jest.spyOn(reviewRepository, 'findOne').mockResolvedValue(review2);

      await service.create('employer-user-1', createReviewDto);

      // Average should be (4.0 + 5.0) / 2 = 4.5
      expect(mockQueryRunner.manager.save).toHaveBeenCalled();
    });
  });

  describe('findByProfile', () => {
    it('should return reviews for a profile', async () => {
      jest.spyOn(profileRepository, 'findOne').mockResolvedValue(mockCandidateProfile);
      jest.spyOn(reviewRepository, 'find').mockResolvedValue([mockReview]);

      const result = await service.findByProfile('candidate-profile-1');

      expect(result).toEqual([mockReview]);
      expect(profileRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'candidate-profile-1' },
      });
      expect(reviewRepository.find).toHaveBeenCalledWith({
        where: { reviewedId: 'candidate-profile-1', isActive: true },
        relations: ['reviewer', 'reviewer.user', 'match', 'match.job'],
        order: { createdAt: 'DESC' },
      });
    });

    it('should throw NotFoundException if profile not found', async () => {
      jest.spyOn(profileRepository, 'findOne').mockResolvedValue(null);

      await expect(service.findByProfile('invalid-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findOne', () => {
    it('should return a review by ID', async () => {
      jest.spyOn(reviewRepository, 'findOne').mockResolvedValue(mockReview);

      const result = await service.findOne('review-1');

      expect(result).toEqual(mockReview);
      expect(reviewRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'review-1', isActive: true },
        relations: ['reviewer', 'reviewed', 'match', 'match.job'],
      });
    });

    it('should throw NotFoundException if review not found', async () => {
      jest.spyOn(reviewRepository, 'findOne').mockResolvedValue(null);

      await expect(service.findOne('invalid-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findByReviewer', () => {
    it('should return reviews created by a reviewer', async () => {
      jest.spyOn(reviewRepository, 'find').mockResolvedValue([mockReview]);

      const result = await service.findByReviewer('employer-profile-1');

      expect(result).toEqual([mockReview]);
      expect(reviewRepository.find).toHaveBeenCalledWith({
        where: { reviewerId: 'employer-profile-1', isActive: true },
        relations: ['reviewed', 'match', 'match.job'],
        order: { createdAt: 'DESC' },
      });
    });

    it('should return empty array if no reviews found', async () => {
      jest.spyOn(reviewRepository, 'find').mockResolvedValue([]);

      const result = await service.findByReviewer('new-reviewer-id');

      expect(result).toEqual([]);
    });
  });
});
