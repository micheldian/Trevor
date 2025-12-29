import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ProfilesService } from './profiles.service';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Profile } from './entities/profile.entity';

@ApiTags('Profiles')
@Controller('profiles')
export class ProfilesController {
  constructor(private readonly profilesService: ProfilesService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Créer un profil',
    description: 'Créer un nouveau profil (worker, team_lead, ou employer)',
  })
  @ApiResponse({
    status: 201,
    description: 'Profil créé avec succès',
    type: Profile,
  })
  async create(
    @Request() req: any,
    @Body() createProfileDto: CreateProfileDto,
  ): Promise<Profile> {
    return this.profilesService.create(req.user.sub, createProfileDto);
  }

  @Get('my-profiles')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Récupérer mes profils',
    description: 'Liste des profils de l\'utilisateur connecté',
  })
  @ApiResponse({
    status: 200,
    description: 'Liste de mes profils',
    type: [Profile],
  })
  async getMyProfiles(@Request() req: any): Promise<Profile[]> {
    return this.profilesService.findByUser(req.user.sub);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupérer un profil par ID' })
  @ApiResponse({
    status: 200,
    description: 'Profil trouvé',
    type: Profile,
  })
  @ApiResponse({ status: 404, description: 'Profil non trouvé' })
  async findOne(@Param('id') id: string): Promise<Profile> {
    return this.profilesService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Mettre à jour un profil' })
  @ApiResponse({
    status: 200,
    description: 'Profil mis à jour',
    type: Profile,
  })
  @ApiResponse({ status: 403, description: 'Non autorisé' })
  @ApiResponse({ status: 404, description: 'Profil non trouvé' })
  async update(
    @Request() req: any,
    @Param('id') id: string,
    @Body() updateProfileDto: UpdateProfileDto,
  ): Promise<Profile> {
    return this.profilesService.update(req.user.sub, id, updateProfileDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Supprimer un profil' })
  @ApiResponse({ status: 200, description: 'Profil supprimé' })
  @ApiResponse({ status: 403, description: 'Non autorisé' })
  @ApiResponse({ status: 404, description: 'Profil non trouvé' })
  async remove(@Request() req: any, @Param('id') id: string): Promise<void> {
    return this.profilesService.remove(req.user.sub, id);
  }
}
