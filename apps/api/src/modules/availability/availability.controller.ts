import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { AvailabilityService } from './availability.service';
import { CreateAvailabilityDto } from './dto/create-availability.dto';
import { UpdateAvailabilityDto } from './dto/update-availability.dto';
import { AvailabilityFilterDto } from './dto/availability-filter.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Availability')
@Controller('availability')
export class AvailabilityController {
  constructor(private readonly availabilityService: AvailabilityService) {}

  @Post('profiles/:profileId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Créer une disponibilité',
    description:
      'Créer une nouvelle disponibilité pour un profil (worker ou team_lead uniquement)',
  })
  @ApiResponse({
    status: 201,
    description: 'Disponibilité créée',
  })
  @ApiResponse({
    status: 403,
    description: 'Type de profil non autorisé (doit être worker ou team_lead)',
  })
  @ApiResponse({
    status: 404,
    description: 'Profil non trouvé',
  })
  async create(
    @CurrentUser() user: User,
    @Param('profileId') profileId: string,
    @Body() dto: CreateAvailabilityDto,
  ) {
    return this.availabilityService.create(user.id, profileId, dto);
  }

  @Public()
  @Get()
  @ApiOperation({
    summary: 'Lister les disponibilités',
    description: 'Récupérer toutes les disponibilités actives avec filtres',
  })
  @ApiResponse({
    status: 200,
    description: 'Liste des disponibilités',
  })
  async findAll(@Query() filters: AvailabilityFilterDto) {
    return this.availabilityService.findAll(filters);
  }

  @Public()
  @Get('nearby')
  @ApiOperation({
    summary: 'Disponibilités à proximité',
    description: 'Trouver les disponibilités dans un rayon donné (recherche géospatiale)',
  })
  @ApiQuery({ name: 'latitude', example: 48.5734 })
  @ApiQuery({ name: 'longitude', example: 7.7521 })
  @ApiQuery({ name: 'radiusKm', example: 30, required: false })
  @ApiResponse({
    status: 200,
    description: 'Disponibilités à proximité triées par distance',
  })
  async findNearby(
    @Query('latitude') latitude: number,
    @Query('longitude') longitude: number,
    @Query('radiusKm') radiusKm?: number,
  ) {
    return this.availabilityService.findNearby(
      Number(latitude),
      Number(longitude),
      radiusKm ? Number(radiusKm) : 50,
    );
  }

  @Public()
  @Get(':id')
  @ApiOperation({
    summary: 'Détails d\'une disponibilité',
    description: 'Récupérer les détails d\'une disponibilité par ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Détails de la disponibilité',
  })
  @ApiResponse({
    status: 404,
    description: 'Disponibilité non trouvée',
  })
  async findOne(@Param('id') id: string) {
    return this.availabilityService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Modifier une disponibilité',
    description: 'Modifier une disponibilité existante (ownership requis)',
  })
  @ApiResponse({
    status: 200,
    description: 'Disponibilité mise à jour',
  })
  @ApiResponse({
    status: 403,
    description: 'Pas autorisé (pas le propriétaire)',
  })
  @ApiResponse({
    status: 404,
    description: 'Disponibilité non trouvée',
  })
  async update(
    @Param('id') id: string,
    @CurrentUser() user: User,
    @Body() dto: UpdateAvailabilityDto,
  ) {
    return this.availabilityService.update(id, user.id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Supprimer une disponibilité',
    description: 'Désactiver une disponibilité (soft delete)',
  })
  @ApiResponse({
    status: 204,
    description: 'Disponibilité supprimée',
  })
  @ApiResponse({
    status: 403,
    description: 'Pas autorisé (pas le propriétaire)',
  })
  @ApiResponse({
    status: 404,
    description: 'Disponibilité non trouvée',
  })
  async remove(@Param('id') id: string, @CurrentUser() user: User) {
    await this.availabilityService.remove(id, user.id);
  }
}
