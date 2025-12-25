import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SearchService } from './search.service';
import { SearchAvailableDto } from './dto/search-available.dto';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Search')
@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Public()
  @Get('available')
  @ApiOperation({
    summary: 'Rechercher profils disponibles',
    description: `
Recherche avancée de profils (workers/teams) disponibles avec tri sophistiqué.

**Tri (ordre de priorité):**
1. Score de match compétences (nombre de skills correspondant)
2. Rating moyen (étoiles)
3. Nombre de missions complétées
4. Distance géographique (si employerId fourni)

**Match Score (0-100):**
- Compétences matchées: 40%
- Rating: 30%
- Expérience: 15%
- Proximité: 15%
    `,
  })
  @ApiResponse({
    status: 200,
    description: 'Liste paginée de profils disponibles',
    schema: {
      example: {
        data: [
          {
            id: 'uuid',
            type: 'worker',
            firstName: 'Jean',
            lastName: 'Dupont',
            city: 'Strasbourg',
            skills: ['viticulture', 'vendanges', 'pomme'],
            experienceYears: 10,
            ratingAvg: 4.5,
            ratingCount: 12,
            completedMissions: 25,
            availability: {
              id: 'availability-uuid',
              dateType: 'today',
              timeSlot: 'morning',
              status: 'on',
            },
            distance: 5.2,
            matchScore: 87,
            matchReasons: {
              skillsMatched: 2,
              totalSkills: 2,
              hasVehicle: true,
              rating: 4.5,
              experience: 10,
              distance: 5.2,
            },
            whatsappNumber: '+33612345678',
          },
        ],
        meta: {
          total: 42,
          limit: 20,
          offset: 0,
          hasMore: true,
          searchQuery: 'pomme',
          filters: {
            dateType: 'today',
            timeSlot: 'morning',
            minRating: 4.0,
            maxDistance: 50,
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Paramètres invalides',
  })
  async searchAvailable(@Query() dto: SearchAvailableDto) {
    return this.searchService.searchAvailable(dto);
  }
}
