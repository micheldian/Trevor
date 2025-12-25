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
import { Match, MatchStatus } from './entities/match.entity';
import { Job, JobStatus } from '../jobs/entities/job.entity';
import { Profile } from '../profiles/entities/profile.entity';
import { ProfileType } from '../profiles/entities/profile.entity';
import { Availability } from '../availability/entities/availability.entity';
import { CreateMatchDto } from './dto/create-match.dto';
import { UpdateMatchStatusDto } from './dto/update-match-status.dto';
import { ConfirmMatchDto } from './dto/confirm-match.dto';
import { CreateMatchResponse } from './interfaces/match-response.interface';
import { ConfirmMatchResponse } from './interfaces/confirm-match-response.interface';

@Injectable()
export class MatchesService {
  private readonly logger = new Logger(MatchesService.name);

  constructor(
    @InjectRepository(Match)
    private readonly matchRepository: Repository<Match>,
    @InjectRepository(Job)
    private readonly jobRepository: Repository<Job>,
    @InjectRepository(Profile)
    private readonly profileRepository: Repository<Profile>,
    @InjectRepository(Availability)
    private readonly availabilityRepository: Repository<Availability>,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Créer un match (click WhatsApp) avec anti-duplication
   */
  async createMatch(
    userId: string,
    dto: CreateMatchDto,
  ): Promise<CreateMatchResponse> {
    const { jobId, candidateId, employerNotes } = dto;

    // Vérifier que le job existe et est actif
    const job = await this.jobRepository.findOne({
      where: { id: jobId, isActive: true },
      relations: ['employer'],
    });

    if (!job) {
      throw new NotFoundException('Mission non trouvée');
    }

    // Vérifier que l'utilisateur est le propriétaire du job
    const employerProfile = await this.profileRepository.findOne({
      where: { id: job.employerId },
    });

    if (!employerProfile || employerProfile.userId !== userId) {
      throw new ForbiddenException(
        'Seul le propriétaire de la mission peut créer un match',
      );
    }

    // Vérifier que le candidat existe et est worker ou team_lead
    const candidate = await this.profileRepository.findOne({
      where: { id: candidateId, isActive: true },
      relations: ['user'],
    });

    if (!candidate) {
      throw new NotFoundException('Profil candidat non trouvé');
    }

    if (
      ![ProfileType.WORKER, ProfileType.TEAM_LEAD].includes(candidate.type)
    ) {
      throw new BadRequestException(
        'Le candidat doit être un worker ou team_lead',
      );
    }

    // Vérifier que le candidat a un numéro WhatsApp
    if (!candidate.whatsappNumber) {
      throw new BadRequestException(
        'Le candidat n\'a pas de numéro WhatsApp configuré',
      );
    }

    // Vérifier si un match existe déjà (anti-duplication)
    let match = await this.matchRepository.findOne({
      where: { jobId, candidateId, isActive: true },
      relations: ['job', 'candidate', 'candidate.user'],
    });

    let isNewMatch = false;

    if (match) {
      // Match existant - retourner avec mise à jour whatsappContacted
      this.logger.log(
        `Match existant trouvé: ${match.id} (job: ${jobId}, candidate: ${candidateId})`,
      );

      // Mettre à jour whatsappContacted si pas déjà fait
      if (!match.whatsappContacted) {
        match.whatsappContacted = true;
        match.whatsappContactedAt = new Date();
        match = await this.matchRepository.save(match);
      }
    } else {
      // Créer un nouveau match
      match = this.matchRepository.create({
        jobId,
        candidateId,
        status: MatchStatus.DISCUSSED,
        employerNotes,
        whatsappContacted: true,
        whatsappContactedAt: new Date(),
      });

      const savedMatch = await this.matchRepository.save(match);

      // Recharger avec relations
      const reloadedMatch = await this.matchRepository.findOne({
        where: { id: savedMatch.id },
        relations: ['job', 'candidate', 'candidate.user'],
      });

      if (!reloadedMatch) {
        throw new Error('Failed to reload created match');
      }

      match = reloadedMatch;
      isNewMatch = true;

      this.logger.log(
        `Nouveau match créé: ${match.id} (job: ${jobId}, candidate: ${candidateId})`,
      );
    }

    // Générer le lien WhatsApp click-to-chat
    const whatsappLink = this.generateWhatsAppLink(
      candidate.whatsappNumber,
      job.title,
      employerProfile.companyName || 'Trevor',
    );

    return {
      match,
      whatsappLink,
      candidatePhone: candidate.whatsappNumber,
      isNewMatch,
    };
  }

  /**
   * Générer un lien WhatsApp click-to-chat
   */
  private generateWhatsAppLink(
    phoneNumber: string,
    jobTitle: string,
    companyName: string,
  ): string {
    // Nettoyer le numéro (enlever espaces, tirets, etc.)
    const cleanPhone = phoneNumber.replace(/[\s\-\(\)]/g, '');

    // Message pré-rempli
    const message = encodeURIComponent(
      `Bonjour, je vous contacte via Trevor concernant la mission "${jobTitle}". Je suis intéressé par votre profil.\n\n${companyName}`,
    );

    // Générer le lien (web.whatsapp.com pour desktop, wa.me pour mobile)
    return `https://wa.me/${cleanPhone}?text=${message}`;
  }

  /**
   * Récupérer tous les matches (avec filtres optionnels)
   */
  async findAll(filters?: {
    jobId?: string;
    candidateId?: string;
    status?: MatchStatus;
  }): Promise<Match[]> {
    const qb = this.matchRepository
      .createQueryBuilder('match')
      .leftJoinAndSelect('match.job', 'job')
      .leftJoinAndSelect('match.candidate', 'candidate')
      .leftJoinAndSelect('candidate.user', 'user')
      .where('match.isActive = :isActive', { isActive: true });

    if (filters?.jobId) {
      qb.andWhere('match.jobId = :jobId', { jobId: filters.jobId });
    }

    if (filters?.candidateId) {
      qb.andWhere('match.candidateId = :candidateId', {
        candidateId: filters.candidateId,
      });
    }

    if (filters?.status) {
      qb.andWhere('match.status = :status', { status: filters.status });
    }

    qb.orderBy('match.createdAt', 'DESC');

    return qb.getMany();
  }

  /**
   * Récupérer un match par ID
   */
  async findOne(id: string): Promise<Match> {
    const match = await this.matchRepository.findOne({
      where: { id, isActive: true },
      relations: ['job', 'candidate', 'candidate.user', 'job.employer'],
    });

    if (!match) {
      throw new NotFoundException('Match non trouvé');
    }

    return match;
  }

  /**
   * Mettre à jour le statut d'un match
   */
  async updateStatus(
    userId: string,
    id: string,
    dto: UpdateMatchStatusDto,
  ): Promise<Match> {
    const match = await this.findOne(id);

    // Vérifier que l'utilisateur a le droit de modifier
    const employerProfile = await this.profileRepository.findOne({
      where: { id: match.job.employerId },
    });

    const candidateProfile = await this.profileRepository.findOne({
      where: { id: match.candidateId },
    });

    const isEmployer = employerProfile && employerProfile.userId === userId;
    const isCandidate = candidateProfile && candidateProfile.userId === userId;

    if (!isEmployer && !isCandidate) {
      throw new ForbiddenException(
        'Seul l\'employeur ou le candidat peut modifier ce match',
      );
    }

    // Mettre à jour le statut
    match.status = dto.status;

    // Ajouter les notes selon qui fait l'action
    if (dto.notes) {
      if (isEmployer) {
        match.employerNotes = dto.notes;
      } else if (isCandidate) {
        match.candidateNotes = dto.notes;
      }
    }

    // Mettre à jour les timestamps selon le statut
    const now = new Date();
    switch (dto.status) {
      case MatchStatus.INTERESTED:
        match.interestedAt = now;
        break;
      case MatchStatus.REJECTED:
        match.rejectedAt = now;
        break;
      case MatchStatus.CONFIRMED:
        match.confirmedAt = now;
        break;
      case MatchStatus.COMPLETED:
        match.completedAt = now;
        break;
    }

    this.logger.log(
      `Match ${id} status changed to ${dto.status} by user ${userId}`,
    );

    return this.matchRepository.save(match);
  }

  /**
   * Confirmer un match (TRANSACTION)
   * - Match passe à confirmed
   * - Job passe à confirmed
   * - Availability du candidat est bloquée (anti double-booking)
   */
  async confirmMatch(
    userId: string,
    matchId: string,
    dto: ConfirmMatchDto,
  ): Promise<ConfirmMatchResponse> {
    // Créer une transaction
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Récupérer le match avec ses relations
      const match = await queryRunner.manager.findOne(Match, {
        where: { id: matchId, isActive: true },
        relations: ['job', 'job.employer', 'candidate', 'candidate.user'],
      });

      if (!match) {
        throw new NotFoundException('Match non trouvé');
      }

      // 2. Vérifier que l'utilisateur est l'employeur
      const employerProfile = await queryRunner.manager.findOne(Profile, {
        where: { id: match.job.employerId },
      });

      if (!employerProfile || employerProfile.userId !== userId) {
        throw new ForbiddenException(
          'Seul l\'employeur peut confirmer un match',
        );
      }

      // 3. Vérifier que le match n'est pas déjà confirmé
      if (match.status === MatchStatus.CONFIRMED) {
        throw new BadRequestException('Ce match est déjà confirmé');
      }

      // 4. Vérifier que le job peut passer à confirmed
      const job = match.job;
      const allowedJobStatuses = [
        JobStatus.PUBLISHED,
        JobStatus.IN_CONTACT,
      ];

      if (!allowedJobStatuses.includes(job.status)) {
        throw new BadRequestException(
          `Le job doit être en statut 'published' ou 'in_contact' pour être confirmé. Statut actuel: ${job.status}`,
        );
      }

      // 5. Trouver l'availability correspondante du candidat
      // On cherche une availability qui correspond au créneau du job
      const availability = await queryRunner.manager.findOne(Availability, {
        where: {
          profileId: match.candidateId,
          dateType: job.dateType as any, // Convertir JobDateType vers DateType
          timeSlot: job.timeSlot as any, // Convertir JobTimeSlot vers TimeSlot
          isActive: true,
        },
        relations: ['profile'],
      });

      if (!availability) {
        throw new BadRequestException(
          `Aucune disponibilité trouvée pour le candidat sur le créneau ${job.dateType} ${job.timeSlot}`,
        );
      }

      // 6. Vérifier que l'availability n'est pas déjà bookée (anti double-booking)
      if (availability.bookedByMatchId) {
        throw new ConflictException(
          `Cette disponibilité est déjà réservée par un autre match (${availability.bookedByMatchId})`,
        );
      }

      // 7. Mettre à jour le match
      match.status = MatchStatus.CONFIRMED;
      match.confirmedAt = new Date();
      if (dto.notes) {
        match.employerNotes = dto.notes;
      }

      // 8. Mettre à jour le job
      job.status = JobStatus.CONFIRMED;
      job.confirmedAt = new Date();

      // 9. Bloquer l'availability
      availability.bookedByMatchId = match.id;
      availability.bookedAt = new Date();

      // Sauvegarder tout dans la transaction
      await queryRunner.manager.save(Match, match);
      await queryRunner.manager.save(Job, job);
      await queryRunner.manager.save(Availability, availability);

      // Commit de la transaction
      await queryRunner.commitTransaction();

      this.logger.log(
        `Match ${matchId} confirmé: job ${job.id} → confirmed, availability ${availability.id} → bloquée`,
      );

      return {
        match,
        job,
        blockedAvailability: availability,
        message: 'Match confirmé avec succès. Le job et la disponibilité ont été mis à jour.',
      };
    } catch (error) {
      // Rollback en cas d'erreur
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      // Libérer le queryRunner
      await queryRunner.release();
    }
  }

  /**
   * Récupérer les matches d'un employeur (via ses jobs)
   */
  async findByEmployer(userId: string, employerId: string): Promise<Match[]> {
    // Vérifier que le profil appartient à l'utilisateur
    const employerProfile = await this.profileRepository.findOne({
      where: { id: employerId, userId },
    });

    if (!employerProfile) {
      throw new NotFoundException('Profil employeur non trouvé');
    }

    // Récupérer tous les jobs de l'employeur
    const jobs = await this.jobRepository.find({
      where: { employerId, isActive: true },
    });

    const jobIds = jobs.map((job) => job.id);

    if (jobIds.length === 0) {
      return [];
    }

    // Récupérer tous les matches de ces jobs
    return this.matchRepository
      .createQueryBuilder('match')
      .leftJoinAndSelect('match.job', 'job')
      .leftJoinAndSelect('match.candidate', 'candidate')
      .leftJoinAndSelect('candidate.user', 'user')
      .where('match.jobId IN (:...jobIds)', { jobIds })
      .andWhere('match.isActive = :isActive', { isActive: true })
      .orderBy('match.createdAt', 'DESC')
      .getMany();
  }

  /**
   * Récupérer les matches d'un candidat
   */
  async findByCandidate(
    userId: string,
    candidateId: string,
  ): Promise<Match[]> {
    // Vérifier que le profil appartient à l'utilisateur
    const candidateProfile = await this.profileRepository.findOne({
      where: { id: candidateId, userId },
    });

    if (!candidateProfile) {
      throw new NotFoundException('Profil candidat non trouvé');
    }

    return this.findAll({ candidateId });
  }
}
