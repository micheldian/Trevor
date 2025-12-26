import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { Review } from './entities/review.entity';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@ApiTags('reviews')
@Controller('reviews')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  @ApiOperation({
    summary: 'Créer un review après une mission completed',
    description:
      'Permet à un employeur ou un candidat de créer un review pour un match completed. Met à jour automatiquement les stats du profil (rating_avg, reliability_score, etc.)',
  })
  @ApiResponse({
    status: 201,
    description: 'Review créé avec succès',
    type: Review,
  })
  @ApiResponse({
    status: 400,
    description:
      'Données invalides ou le match n\'est pas dans le statut "completed"',
  })
  @ApiResponse({
    status: 403,
    description: 'Seul l\'employeur ou le candidat peut créer un review',
  })
  @ApiResponse({
    status: 404,
    description: 'Match ou profil non trouvé',
  })
  @ApiResponse({
    status: 409,
    description: 'Un review a déjà été créé pour ce match par cet utilisateur',
  })
  async create(
    @Request() req: any,
    @Body() createReviewDto: CreateReviewDto,
  ): Promise<Review> {
    return this.reviewsService.create(req.user.userId, createReviewDto);
  }

  @Get('profile/:profileId')
  @ApiOperation({
    summary: 'Récupérer tous les reviews reçus par un profil',
    description:
      'Retourne la liste des reviews qu\'un profil a reçus, triés par date (plus récents en premier)',
  })
  @ApiParam({
    name: 'profileId',
    description: 'ID du profil',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Liste des reviews du profil',
    type: [Review],
  })
  @ApiResponse({
    status: 404,
    description: 'Profil non trouvé',
  })
  async findByProfile(@Param('profileId') profileId: string): Promise<Review[]> {
    return this.reviewsService.findByProfile(profileId);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Récupérer un review par ID',
    description: 'Retourne les détails d\'un review spécifique',
  })
  @ApiParam({
    name: 'id',
    description: 'ID du review',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Détails du review',
    type: Review,
  })
  @ApiResponse({
    status: 404,
    description: 'Review non trouvé',
  })
  async findOne(@Param('id') id: string): Promise<Review> {
    return this.reviewsService.findOne(id);
  }

  @Get('reviewer/:reviewerId')
  @ApiOperation({
    summary: 'Récupérer tous les reviews créés par un profil',
    description:
      'Retourne la liste des reviews qu\'un profil a donnés à d\'autres',
  })
  @ApiParam({
    name: 'reviewerId',
    description: 'ID du reviewer (profil qui a donné les reviews)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Liste des reviews créés par ce profil',
    type: [Review],
  })
  async findByReviewer(
    @Param('reviewerId') reviewerId: string,
  ): Promise<Review[]> {
    return this.reviewsService.findByReviewer(reviewerId);
  }
}
