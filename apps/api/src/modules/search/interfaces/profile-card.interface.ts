export interface ProfileCard {
  id: string;
  type: 'worker' | 'team_lead' | 'team';

  // User info
  firstName: string;
  lastName: string;
  avatarUrl?: string;

  // Profile info
  city: string;
  postalCode: string;
  bio?: string;
  skills: string[];
  experienceYears: number;
  certifications: string[];
  hasVehicle: boolean;

  // Rating
  ratingAvg: number;
  ratingCount: number;

  // Stats
  completedMissions: number;

  // Availability
  availability: {
    id: string;
    dateType: string;
    timeSlot: string;
    status: string;
    notes?: string;
  };

  // Geolocation
  distance?: number; // En km (si employerId fourni)

  // Match score
  matchScore: number; // 0-100
  matchReasons: {
    skillsMatched: number;
    totalSkills: number;
    hasVehicle: boolean;
    rating: number;
    experience: number;
    distance?: number;
  };

  // Contact
  whatsappNumber?: string;

  // Team info (si type = team)
  teamName?: string;
  teamSize?: number;
  teamLeadName?: string;
}

export interface SearchAvailableResponse {
  data: ProfileCard[];
  meta: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
    searchQuery?: string;
    filters: {
      dateType?: string;
      timeSlot?: string;
      minRating?: number;
      maxDistance?: number;
    };
  };
}
