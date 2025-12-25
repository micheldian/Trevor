import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { MatchesService } from './matches.service';
import { CreateMatchDto } from './dto/create-match.dto';
import { UpdateMatchStatusDto } from './dto/update-match-status.dto';
import { ConfirmMatchDto } from './dto/confirm-match.dto';
import { Match, MatchStatus } from './entities/match.entity';
import { CreateMatchResponse } from './interfaces/match-response.interface';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Matches')
@Controller('matches')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class MatchesController {
  constructor(private readonly matchesService: MatchesService) {}

  @Post()
  @ApiOperation({
    summary: 'Créer un match (click WhatsApp)',
    description:
      'Créer un match entre un job et un candidat. Anti-duplication: retourne le match existant si déjà créé. Génère un lien WhatsApp click-to-chat.',
  })
  @ApiResponse({
    status: 201,
    description: 'Match créé ou existant retourné avec lien WhatsApp',
    schema: {
      example: {
        match: {
          id: '123e4567-e89b-12d3-a456-426614174000',
          jobId: 'job-123',
          candidateId: 'candidate-456',
          status: 'discussed',
          whatsappContacted: true,
          whatsappContactedAt: '2024-09-15T10:30:00Z',
          createdAt: '2024-09-15T10:30:00Z',
        },
        whatsappLink:
          'https://wa.me/33612345678?text=Bonjour%2C%20je%20vous%20contacte%20via%20Trevor...',
        candidatePhone: '+33612345678',
        isNewMatch: true,
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: 'Seul le propriétaire du job peut créer un match',
  })
  @ApiResponse({ status: 404, description: 'Job ou candidat non trouvé' })
  @ApiResponse({
    status: 400,
    description: 'Candidat invalide ou pas de numéro WhatsApp',
  })
  async create(
    @Request() req,
    @Body() createMatchDto: CreateMatchDto,
  ): Promise<CreateMatchResponse> {
    return this.matchesService.createMatch(req.user.userId, createMatchDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Récupérer tous les matches',
    description: 'Liste des matches avec filtres optionnels',
  })
  @ApiQuery({
    name: 'jobId',
    required: false,
    description: 'Filtrer par job',
  })
  @ApiQuery({
    name: 'candidateId',
    required: false,
    description: 'Filtrer par candidat',
  })
  @ApiQuery({
    name: 'status',
    enum: MatchStatus,
    required: false,
    description: 'Filtrer par statut',
  })
  @ApiResponse({
    status: 200,
    description: 'Liste des matches',
    type: [Match],
  })
  async findAll(
    @Query('jobId') jobId?: string,
    @Query('candidateId') candidateId?: string,
    @Query('status') status?: MatchStatus,
  ): Promise<Match[]> {
    return this.matchesService.findAll({
      jobId,
      candidateId,
      status,
    });
  }

  @Get('employer/:employerId')
  @ApiOperation({
    summary: 'Récupérer les matches d\'un employeur',
    description: 'Liste des matches pour tous les jobs d\'un employeur',
  })
  @ApiResponse({
    status: 200,
    description: 'Liste des matches de l\'employeur',
    type: [Match],
  })
  @ApiResponse({ status: 404, description: 'Profil employeur non trouvé' })
  async findByEmployer(
    @Request() req,
    @Param('employerId') employerId: string,
  ): Promise<Match[]> {
    return this.matchesService.findByEmployer(req.user.userId, employerId);
  }

  @Get('candidate/:candidateId')
  @ApiOperation({
    summary: 'Récupérer les matches d\'un candidat',
    description: 'Liste des matches pour un profil candidat (worker/team_lead)',
  })
  @ApiResponse({
    status: 200,
    description: 'Liste des matches du candidat',
    type: [Match],
  })
  @ApiResponse({ status: 404, description: 'Profil candidat non trouvé' })
  async findByCandidate(
    @Request() req,
    @Param('candidateId') candidateId: string,
  ): Promise<Match[]> {
    return this.matchesService.findByCandidate(req.user.userId, candidateId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupérer un match par ID' })
  @ApiResponse({
    status: 200,
    description: 'Match trouvé',
    type: Match,
  })
  @ApiResponse({ status: 404, description: 'Match non trouvé' })
  async findOne(@Param('id') id: string): Promise<Match> {
    return this.matchesService.findOne(id);
  }

  @Patch(':id/status')
  @ApiOperation({
    summary: 'Mettre à jour le statut d\'un match',
    description:
      'Seul l\'employeur ou le candidat peut modifier. Les notes sont ajoutées selon qui fait l\'action.',
  })
  @ApiResponse({
    status: 200,
    description: 'Statut mis à jour',
    type: Match,
  })
  @ApiResponse({
    status: 403,
    description: 'Seul l\'employeur ou le candidat peut modifier',
  })
  @ApiResponse({ status: 404, description: 'Match non trouvé' })
  async updateStatus(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: UpdateMatchStatusDto,
  ): Promise<Match> {
    return this.matchesService.updateStatus(req.user.userId, id, dto);
  }

  @Post(':id/confirm')
  @ApiOperation({
    summary: 'Confirmer un match (TRANSACTION)',
    description: `
      Confirme un match et effectue les actions suivantes en une seule transaction:
      1. Match → status confirmed
      2. Job → status confirmed
      3. Availability du candidat → bloquée (anti double-booking)

      Seul l'employeur peut confirmer un match.
      Le job doit être en statut 'published' ou 'in_contact'.
      La disponibilité doit exister et ne pas être déjà réservée.
    `,
  })
  @ApiResponse({
    status: 201,
    description: 'Match confirmé avec succès (transaction commit)',
    schema: {
      example: {
        match: { id: '...', status: 'confirmed', confirmedAt: '...' },
        job: { id: '...', status: 'confirmed', confirmedAt: '...' },
        blockedAvailability: {
          id: '...',
          bookedByMatchId: 'match-id',
          bookedAt: '...',
        },
        message: 'Match confirmé avec succès...',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Match déjà confirmé, job invalide, ou disponibilité manquante',
  })
  @ApiResponse({
    status: 403,
    description: 'Seul l\'employeur peut confirmer',
  })
  @ApiResponse({
    status: 404,
    description: 'Match non trouvé',
  })
  @ApiResponse({
    status: 409,
    description: 'Conflit: disponibilité déjà réservée (double booking)',
  })
  async confirmMatch(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: ConfirmMatchDto,
  ) {
    return this.matchesService.confirmMatch(req.user.userId, id, dto);
  }
}
