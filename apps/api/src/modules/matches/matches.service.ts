import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Match, MatchStatus } from './entities/match.entity';
import { Job } from '../jobs/entities/job.entity';
import { Profile } from '../profiles/entities/profile.entity';
import { ProfileType } from '../profiles/entities/profile.entity';
import { CreateMatchDto } from './dto/create-match.dto';
import { UpdateMatchStatusDto } from './dto/update-match-status.dto';
import { CreateMatchResponse } from './interfaces/match-response.interface';

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
