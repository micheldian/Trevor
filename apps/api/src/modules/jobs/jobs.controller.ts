import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
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
import { JobsService } from './jobs.service';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { TransitionJobStatusDto } from './dto/transition-job-status.dto';
import { Job, JobStatus } from './entities/job.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Jobs')
@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Créer une nouvelle mission',
    description: 'Créer une mission avec le profil employeur de l\'utilisateur connecté',
  })
  @ApiResponse({
    status: 201,
    description: 'Mission créée avec succès',
    type: Job,
  })
  @ApiResponse({ status: 403, description: 'Profil employeur requis' })
  async createJob(
    @Request() req: any,
    @Body() createJobDto: CreateJobDto,
  ): Promise<Job> {
    return this.jobsService.createForUser(req.user.id, createJobDto);
  }

  @Post('profiles/:profileId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Créer une nouvelle mission',
    description: 'Seuls les employeurs peuvent créer des missions',
  })
  @ApiResponse({
    status: 201,
    description: 'Mission créée avec succès',
    type: Job,
  })
  @ApiResponse({ status: 403, description: 'Seuls les employeurs autorisés' })
  @ApiResponse({ status: 404, description: 'Profil non trouvé' })
  async create(
    @Request() req: any,
    @Param('profileId') profileId: string,
    @Body() createJobDto: CreateJobDto,
  ): Promise<Job> {
    return this.jobsService.create(req.user.id, profileId, createJobDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Récupérer toutes les missions',
    description: 'Liste des missions avec filtres optionnels',
  })
  @ApiQuery({
    name: 'status',
    enum: JobStatus,
    required: false,
    description: 'Filtrer par statut',
  })
  @ApiQuery({
    name: 'employerId',
    required: false,
    description: 'Filtrer par employeur',
  })
  @ApiQuery({
    name: 'culture',
    required: false,
    description: 'Filtrer par culture',
  })
  @ApiQuery({
    name: 'isUrgent',
    required: false,
    description: 'Filtrer missions urgentes',
  })
  @ApiResponse({
    status: 200,
    description: 'Liste des missions',
    type: [Job],
  })
  async findAll(
    @Query('status') status?: JobStatus,
    @Query('employerId') employerId?: string,
    @Query('culture') culture?: string,
    @Query('isUrgent') isUrgent?: boolean,
  ): Promise<Job[]> {
    return this.jobsService.findAll({
      status,
      employerId,
      culture,
      isUrgent,
    });
  }

  @Get('my-jobs')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Récupérer mes missions',
    description: 'Liste des missions créées par l\'utilisateur connecté',
  })
  @ApiResponse({
    status: 200,
    description: 'Liste de mes missions',
    type: [Job],
  })
  async getMyJobs(@Request() req: any): Promise<Job[]> {
    // Get all employer profiles for this user and return their jobs
    return this.jobsService.findByUser(req.user.id);
  }

  @Get('profiles/:profileId/jobs')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Récupérer les missions d\'un employeur',
    description: 'Liste des missions créées par un profil employeur',
  })
  @ApiResponse({
    status: 200,
    description: 'Liste des missions de l\'employeur',
    type: [Job],
  })
  @ApiResponse({ status: 404, description: 'Profil non trouvé' })
  async findByEmployer(
    @Request() req: any,
    @Param('profileId') profileId: string,
  ): Promise<Job[]> {
    return this.jobsService.findByEmployer(req.user.id, profileId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupérer une mission par ID' })
  @ApiResponse({
    status: 200,
    description: 'Mission trouvée',
    type: Job,
  })
  @ApiResponse({ status: 404, description: 'Mission non trouvée' })
  async findOne(@Param('id') id: string): Promise<Job> {
    return this.jobsService.findOne(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Mettre à jour une mission',
    description:
      'Seul le propriétaire peut modifier. Impossible si confirmée/complétée/annulée',
  })
  @ApiResponse({
    status: 200,
    description: 'Mission mise à jour',
    type: Job,
  })
  @ApiResponse({ status: 403, description: 'Accès refusé' })
  @ApiResponse({ status: 404, description: 'Mission non trouvée' })
  @ApiResponse({
    status: 400,
    description: 'Impossible de modifier dans cet état',
  })
  async update(
    @Request() req: any,
    @Param('id') id: string,
    @Body() updateJobDto: UpdateJobDto,
  ): Promise<Job> {
    return this.jobsService.update(req.user.id, id, updateJobDto);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Changer le statut d\'une mission',
    description: `
      Transitions autorisées:
      - draft → published, cancelled
      - published → in_contact, cancelled, draft
      - in_contact → confirmed, cancelled, published
      - confirmed → completed, cancelled
      - completed → (état final)
      - cancelled → (état final)
    `,
  })
  @ApiResponse({
    status: 200,
    description: 'Statut mis à jour',
    type: Job,
  })
  @ApiResponse({ status: 400, description: 'Transition non autorisée' })
  @ApiResponse({ status: 403, description: 'Accès refusé' })
  @ApiResponse({ status: 404, description: 'Mission non trouvée' })
  async transitionStatus(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: TransitionJobStatusDto,
  ): Promise<Job> {
    return this.jobsService.transitionStatus(req.user.id, id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Supprimer une mission (soft delete)',
    description: 'Seules les missions draft/published/cancelled peuvent être supprimées',
  })
  @ApiResponse({ status: 200, description: 'Mission supprimée' })
  @ApiResponse({ status: 403, description: 'Accès refusé' })
  @ApiResponse({ status: 404, description: 'Mission non trouvée' })
  @ApiResponse({
    status: 400,
    description: 'Impossible de supprimer dans cet état',
  })
  async remove(@Request() req: any, @Param('id') id: string): Promise<void> {
    return this.jobsService.remove(req.user.id, id);
  }
}
