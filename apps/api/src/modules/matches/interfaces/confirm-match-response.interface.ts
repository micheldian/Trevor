import { Match } from '../entities/match.entity';
import { Job } from '../../jobs/entities/job.entity';
import { Availability } from '../../availability/entities/availability.entity';

export interface ConfirmMatchResponse {
  match: Match;
  job: Job;
  blockedAvailability: Availability;
  message: string;
}
