import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Job, JobStatus, JobDateType } from './entities/job.entity';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { TransitionJobStatusDto } from './dto/transition-job-status.dto';
import { Profile } from '../profiles/entities/profile.entity';
import { ProfileType } from '../profiles/entities/profile.entity';

@Injectable()
export class JobsService {
  private readonly logger = new Logger(JobsService.name);

  // Définir les transitions de statut autorisées
  private readonly ALLOWED_TRANSITIONS: Record<JobStatus, JobStatus[]> = {
    [JobStatus.DRAFT]: [JobStatus.PUBLISHED, JobStatus.CANCELLED],
    [JobStatus.PUBLISHED]: [
      JobStatus.IN_CONTACT,
      JobStatus.CANCELLED,
      JobStatus.DRAFT,
    ],
    [JobStatus.IN_CONTACT]: [
      JobStatus.CONFIRMED,
      JobStatus.CANCELLED,
      JobStatus.PUBLISHED,
    ],
    [JobStatus.CONFIRMED]: [JobStatus.COMPLETED, JobStatus.CANCELLED],
    [JobStatus.COMPLETED]: [], // État final
    [JobStatus.CANCELLED]: [], // État final
  };

  constructor(
    @InjectRepository(Job)
    private readonly jobRepository: Repository<Job>,
    @InjectRepository(Profile)
    private readonly profileRepository: Repository<Profile>,
  ) {}

  /**
   * Créer une nouvelle mission (seuls les employers)
   */
  async create(userId: string, employerId: string, dto: CreateJobDto): Promise<Job> {
    // Vérifier que le profil existe et appartient à l'utilisateur
    const employerProfile = await this.profileRepository.findOne({
      where: { id: employerId, userId },
    });

    if (!employerProfile) {
      throw new NotFoundException('Profil employeur non trouvé');
    }

    // Vérifier que c'est bien un employeur
    if (employerProfile.type !== ProfileType.EMPLOYER) {
      throw new ForbiddenException(
        'Seuls les employeurs peuvent créer des missions',
      );
    }

    // Validation: si dateType = specific_date, specificDate doit être fourni
    if (dto.dateType === JobDateType.SPECIFIC_DATE && !dto.specificDate) {
      throw new BadRequestException(
        'specificDate est requis quand dateType = specific_date',
      );
    }

    // Créer le job
    const job = this.jobRepository.create({
      employerId,
      ...dto,
      tags: dto.tags || [],
      requiredSkills: dto.requiredSkills || [],
      status: JobStatus.DRAFT,
      isUrgent: dto.isUrgent || false,
    });

    return this.jobRepository.save(job);
  }

  /**
   * Récupérer tous les jobs (avec filtres optionnels)
   */
  async findAll(filters?: {
    status?: JobStatus;
    employerId?: string;
    culture?: string;
    isUrgent?: boolean;
  }): Promise<Job[]> {
    const qb = this.jobRepository
      .createQueryBuilder('job')
      .leftJoinAndSelect('job.employer', 'employer')
      .leftJoinAndSelect('employer.user', 'user')
      .where('job.isActive = :isActive', { isActive: true });

    if (filters?.status) {
      qb.andWhere('job.status = :status', { status: filters.status });
    }

    if (filters?.employerId) {
      qb.andWhere('job.employerId = :employerId', {
        employerId: filters.employerId,
      });
    }

    if (filters?.culture) {
      qb.andWhere('job.culture ILIKE :culture', {
        culture: `%${filters.culture}%`,
      });
    }

    if (filters?.isUrgent !== undefined) {
      qb.andWhere('job.isUrgent = :isUrgent', { isUrgent: filters.isUrgent });
    }

    qb.orderBy('job.createdAt', 'DESC');

    return qb.getMany();
  }

  /**
   * Récupérer une mission par ID
   */
  async findOne(id: string): Promise<Job> {
    const job = await this.jobRepository.findOne({
      where: { id, isActive: true },
      relations: ['employer', 'employer.user'],
    });

    if (!job) {
      throw new NotFoundException('Mission non trouvée');
    }

    return job;
  }

  /**
   * Mettre à jour une mission
   */
  async update(
    userId: string,
    id: string,
    dto: UpdateJobDto,
  ): Promise<Job> {
    const job = await this.findOne(id);

    // Vérifier que le job appartient à l'utilisateur
    await this.verifyOwnership(userId, job);

    // Ne peut pas modifier une mission confirmée, complétée ou annulée
    if (
      [JobStatus.CONFIRMED, JobStatus.COMPLETED, JobStatus.CANCELLED].includes(
        job.status,
      )
    ) {
      throw new BadRequestException(
        `Impossible de modifier une mission avec le statut ${job.status}`,
      );
    }

    // Validation: si dateType = specific_date, specificDate doit être fourni
    if (dto.dateType === JobDateType.SPECIFIC_DATE && !dto.specificDate) {
      throw new BadRequestException(
        'specificDate est requis quand dateType = specific_date',
      );
    }

    // Mettre à jour
    Object.assign(job, dto);

    return this.jobRepository.save(job);
  }

  /**
   * Supprimer une mission (soft delete)
   */
  async remove(userId: string, id: string): Promise<void> {
    const job = await this.findOne(id);

    // Vérifier que le job appartient à l'utilisateur
    await this.verifyOwnership(userId, job);

    // Seuls les jobs draft ou published peuvent être supprimés
    if (
      ![JobStatus.DRAFT, JobStatus.PUBLISHED, JobStatus.CANCELLED].includes(
        job.status,
      )
    ) {
      throw new BadRequestException(
        'Seules les missions draft, published ou cancelled peuvent être supprimées',
      );
    }

    job.isActive = false;
    await this.jobRepository.save(job);
  }

  /**
   * Transition de statut avec validation
   */
  async transitionStatus(
    userId: string,
    id: string,
    dto: TransitionJobStatusDto,
  ): Promise<Job> {
    const job = await this.findOne(id);

    // Vérifier que le job appartient à l'utilisateur
    await this.verifyOwnership(userId, job);

    const currentStatus = job.status;
    const newStatus = dto.status;

    // Vérifier que le statut change
    if (currentStatus === newStatus) {
      throw new BadRequestException(
        `La mission est déjà au statut ${newStatus}`,
      );
    }

    // Vérifier que la transition est autorisée
    if (!this.isTransitionAllowed(currentStatus, newStatus)) {
      throw new BadRequestException(
        `Transition de ${currentStatus} vers ${newStatus} non autorisée. Transitions possibles: ${this.ALLOWED_TRANSITIONS[currentStatus].join(', ')}`,
      );
    }

    // Validation spécifique pour published
    if (newStatus === JobStatus.PUBLISHED) {
      this.validatePublishing(job);
    }

    // Validation: raison obligatoire pour cancellation
    if (newStatus === JobStatus.CANCELLED && !dto.reason) {
      throw new BadRequestException(
        'Une raison est requise pour annuler une mission',
      );
    }

    // Appliquer le changement de statut
    job.status = newStatus;

    // Mettre à jour les timestamps selon le statut
    const now = new Date();
    switch (newStatus) {
      case JobStatus.PUBLISHED:
        job.publishedAt = now;
        break;
      case JobStatus.CONFIRMED:
        job.confirmedAt = now;
        break;
      case JobStatus.COMPLETED:
        job.completedAt = now;
        break;
      case JobStatus.CANCELLED:
        job.cancelledAt = now;
        job.cancellationReason = dto.reason;
        break;
    }

    this.logger.log(
      `Job ${id} transitioned from ${currentStatus} to ${newStatus}`,
    );

    return this.jobRepository.save(job);
  }

  /**
   * Vérifier si une transition est autorisée
   */
  private isTransitionAllowed(
    currentStatus: JobStatus,
    newStatus: JobStatus,
  ): boolean {
    return this.ALLOWED_TRANSITIONS[currentStatus]?.includes(newStatus) || false;
  }

  /**
   * Valider qu'un job peut être publié
   */
  private validatePublishing(job: Job): void {
    // Vérifier que tous les champs requis sont remplis
    if (!job.title || job.title.length < 5) {
      throw new BadRequestException('Titre requis (min 5 caractères)');
    }

    if (!job.culture) {
      throw new BadRequestException('Culture requise');
    }

    if (!job.nbPeople || job.nbPeople < 1) {
      throw new BadRequestException('Nombre de personnes requis (min 1)');
    }

    if (!job.latitude || !job.longitude) {
      throw new BadRequestException('Localisation requise');
    }

    // Si date spécifique, vérifier qu'elle est dans le futur
    if (job.dateType === JobDateType.SPECIFIC_DATE) {
      if (!job.specificDate) {
        throw new BadRequestException('Date spécifique requise');
      }

      const specificDate = new Date(job.specificDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (specificDate < today) {
        throw new BadRequestException(
          'La date spécifique doit être dans le futur',
        );
      }
    }
  }

  /**
   * Vérifier que l'utilisateur est propriétaire du job
   */
  private async verifyOwnership(userId: string, job: Job): Promise<void> {
    const employerProfile = await this.profileRepository.findOne({
      where: { id: job.employerId },
    });

    if (!employerProfile || employerProfile.userId !== userId) {
      throw new ForbiddenException(
        'Vous ne pouvez pas modifier cette mission',
      );
    }
  }

  /**
   * Récupérer les jobs d'un employeur
   */
  async findByEmployer(userId: string, employerId: string): Promise<Job[]> {
    // Vérifier que le profil appartient à l'utilisateur
    const employerProfile = await this.profileRepository.findOne({
      where: { id: employerId, userId },
    });

    if (!employerProfile) {
      throw new NotFoundException('Profil employeur non trouvé');
    }

    return this.findAll({ employerId });
  }

  /**
   * Récupérer toutes les missions de l'utilisateur (tous ses profils employers)
   */
  async findByUser(userId: string): Promise<Job[]> {
    // Get all employer profiles for this user
    const employerProfiles = await this.profileRepository.find({
      where: { userId, profileType: ProfileType.EMPLOYER },
    });

    if (employerProfiles.length === 0) {
      return [];
    }

    // Get jobs for all employer profiles
    const employerIds = employerProfiles.map((p) => p.id);

    return this.jobRepository.find({
      where: employerIds.map((employerId) => ({ employerId, isActive: true })),
      relations: ['employer', 'employer.user'],
      order: { createdAt: 'DESC' },
    });
  }
}
