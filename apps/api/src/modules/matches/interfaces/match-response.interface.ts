import { Match } from '../entities/match.entity';

export interface CreateMatchResponse {
  match: Match;
  whatsappLink: string;
  candidatePhone: string;
  isNewMatch: boolean;
}
