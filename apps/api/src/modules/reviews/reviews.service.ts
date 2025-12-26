import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Review } from './entities/review.entity';
import { Match, MatchStatus } from '../matches/entities/match.entity';
import { Profile } from '../profiles/entities/profile.entity';
import { CreateReviewDto } from './dto/create-review.dto';

@Injectable()
export class ReviewsService {
  private readonly logger = new Logger(ReviewsService.name);

  constructor(
    @InjectRepository(Review)
    private readonly reviewRepository: Repository<Review>,
    @InjectRepository(Match)
    private readonly matchRepository: Repository<Match>,
    @InjectRepository(Profile)
    private readonly profileRepository: Repository<Profile>,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Créer un review (TRANSACTION avec mise à jour des stats)
   */
  async create(userId: string, dto: CreateReviewDto): Promise<Review> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Récupérer le match avec relations
      const match = await queryRunner.manager.findOne(Match, {
        where: { id: dto.matchId, isActive: true },
        relations: ['job', 'job.employer', 'candidate'],
      });

      if (!match) {
        throw new NotFoundException('Match non trouvé');
      }

      // 2. Vérifier que le match est completed
      if (match.status !== MatchStatus.COMPLETED) {
        throw new BadRequestException(
          'Un review ne peut être créé que pour un match completed',
        );
      }

      // 3. Déterminer qui est le reviewer et qui est reviewed
      const employerProfile = await queryRunner.manager.findOne(Profile, {
        where: { id: match.job.employerId },
      });

      const candidateProfile = await queryRunner.manager.findOne(Profile, {
        where: { id: match.candidateId },
      });

      if (!employerProfile || !candidateProfile) {
        throw new NotFoundException('Profil non trouvé');
      }

      const isEmployer = employerProfile.userId === userId;
      const isCandidate = candidateProfile.userId === userId;

      if (!isEmployer && !isCandidate) {
        throw new ForbiddenException(
          'Seul l\'employeur ou le candidat peut créer un review',
        );
      }

      const reviewerId = isEmployer ? employerProfile.id : candidateProfile.id;
      const reviewedId = isEmployer ? candidateProfile.id : employerProfile.id;

      // 4. Vérifier anti-duplication (un seul review par reviewer/match)
      const existingReview = await queryRunner.manager.findOne(Review, {
        where: { matchId: match.id, reviewerId },
      });

      if (existingReview) {
        throw new ConflictException(
          'Vous avez déjà créé un review pour ce match',
        );
      }

      // 5. Créer le review
      const review = queryRunner.manager.create(Review, {
        matchId: match.id,
        reviewerId,
        reviewedId,
        rating: dto.rating,
        professionalism: dto.professionalism,
        punctuality: dto.punctuality,
        communication: dto.communication,
        quality: dto.quality,
        comment: dto.comment,
        wasNoShow: dto.wasNoShow || false,
        wasCancelled: dto.wasCancelled || false,
        cancellationReason: dto.cancellationReason,
        wouldWorkAgain: dto.wouldWorkAgain,
      });

      await queryRunner.manager.save(Review, review);

      // 6. Mettre à jour les stats du profil reviewed
      await this.updateProfileStats(queryRunner, reviewedId, dto);

      // Commit de la transaction
      await queryRunner.commitTransaction();

      this.logger.log(
        `Review créé: ${review.id} (reviewer: ${reviewerId}, reviewed: ${reviewedId}, rating: ${dto.rating})`,
      );

      // Recharger avec relations
      const reloadedReview = await this.reviewRepository.findOne({
        where: { id: review.id },
        relations: ['reviewer', 'reviewed', 'match'],
      });

      if (!reloadedReview) {
        throw new Error('Failed to reload created review');
      }

      return reloadedReview;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Mettre à jour les stats d'un profil après un review
   */
  private async updateProfileStats(
    queryRunner: any,
    profileId: string,
    dto: CreateReviewDto,
  ): Promise<void> {
    const profile = await queryRunner.manager.findOne(Profile, {
      where: { id: profileId },
    });

    if (!profile) {
      throw new NotFoundException('Profil non trouvé');
    }

    // Récupérer tous les reviews de ce profil (incluant le nouveau)
    const allReviews = await queryRunner.manager.find(Review, {
      where: { reviewedId: profileId, isActive: true },
    });

    // Calculer rating_avg
    const totalRating = allReviews.reduce(
      (sum: number, r: Review) => sum + Number(r.rating),
      0,
    );
    const ratingCount = allReviews.length;
    const ratingAvg = ratingCount > 0 ? totalRating / ratingCount : 0;

    // Calculer missions_count (reviews créés = missions effectuées)
    const missionsCount = ratingCount;

    // Compter completed missions (sans no-show ni cancel)
    const completedMissionsCount = allReviews.filter(
      (r: Review) => !r.wasNoShow && !r.wasCancelled,
    ).length;

    // Compter no-shows et annulations
    const noShowCount = allReviews.filter((r: Review) => r.wasNoShow).length;
    const cancelledCount = allReviews.filter(
      (r: Review) => r.wasCancelled,
    ).length;

    // Calculer reliability_score
    // Formule: 100 - (no_show * 20 + cancelled * 10)
    // Score min: 0, max: 100
    const reliabilityScore = Math.max(
      0,
      100 - noShowCount * 20 - cancelledCount * 10,
    );

    // Mettre à jour le profil
    profile.ratingAvg = Number(ratingAvg.toFixed(2));
    profile.ratingCount = ratingCount;
    profile.missionsCount = missionsCount;
    profile.completedMissionsCount = completedMissionsCount;
    profile.noShowCount = noShowCount;
    profile.cancelledCount = cancelledCount;
    profile.reliabilityScore = reliabilityScore;

    await queryRunner.manager.save(Profile, profile);

    this.logger.log(
      `Profile ${profileId} stats updated: rating=${profile.ratingAvg}, count=${profile.ratingCount}, reliability=${profile.reliabilityScore}`,
    );
  }

  /**
   * Récupérer les reviews d'un profil
   */
  async findByProfile(profileId: string): Promise<Review[]> {
    const profile = await this.profileRepository.findOne({
      where: { id: profileId },
    });

    if (!profile) {
      throw new NotFoundException('Profil non trouvé');
    }

    return this.reviewRepository.find({
      where: { reviewedId: profileId, isActive: true },
      relations: ['reviewer', 'reviewer.user', 'match', 'match.job'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Récupérer un review par ID
   */
  async findOne(id: string): Promise<Review> {
    const review = await this.reviewRepository.findOne({
      where: { id, isActive: true },
      relations: ['reviewer', 'reviewed', 'match', 'match.job'],
    });

    if (!review) {
      throw new NotFoundException('Review non trouvé');
    }

    return review;
  }

  /**
   * Récupérer les reviews créés par un profil
   */
  async findByReviewer(reviewerId: string): Promise<Review[]> {
    return this.reviewRepository.find({
      where: { reviewerId, isActive: true },
      relations: ['reviewed', 'match', 'match.job'],
      order: { createdAt: 'DESC' },
    });
  }
}
