import { ApiProperty } from '@nestjs/swagger';

/**
 * Alert for employers with high cancellation rates
 */
export class HighCancellationEmployerAlertDto {
  @ApiProperty()
  employerId: string;

  @ApiProperty()
  employerName?: string;

  @ApiProperty({ description: 'Total jobs created in the last 30 days' })
  totalJobs: number;

  @ApiProperty({ description: 'Number of cancelled jobs in the last 30 days' })
  cancelledJobs: number;

  @ApiProperty({ description: 'Cancellation rate percentage' })
  cancellationRate: number;

  @ApiProperty({ description: 'Severity level: critical (>50%), high (30-50%), medium (<30%)' })
  severity: 'critical' | 'high' | 'medium';

  @ApiProperty()
  detectedAt: Date;
}

/**
 * Alert for workers with multiple no-shows
 */
export class NoShowWorkerAlertDto {
  @ApiProperty()
  candidateId: string;

  @ApiProperty()
  candidateName?: string;

  @ApiProperty()
  city?: string;

  @ApiProperty({ description: 'Total confirmed matches' })
  totalConfirmed: number;

  @ApiProperty({ description: 'Number of no-shows (confirmed then cancelled)' })
  noShowCount: number;

  @ApiProperty({ description: 'No-show rate percentage' })
  noShowRate: number;

  @ApiProperty({ description: 'Severity level: critical (>=3), high (2)' })
  severity: 'critical' | 'high';

  @ApiProperty()
  detectedAt: Date;
}

/**
 * Alert for unfulfilled demand spikes
 */
export class UnfulfilledDemandAlertDto {
  @ApiProperty({ description: 'Total jobs without confirmed matches for >48h' })
  totalUnfulfilledJobs: number;

  @ApiProperty({ description: 'Jobs created in last 7 days without matches' })
  recentUnfulfilledJobs: number;

  @ApiProperty({ description: 'Percentage increase compared to previous 7 days' })
  increasePercentage: number;

  @ApiProperty({ description: 'Most affected cultures/tags' })
  affectedCultures: string[];

  @ApiProperty({ description: 'Most affected locations' })
  affectedLocations: string[];

  @ApiProperty({ description: 'Severity level: critical (>50% increase), high (20-50%), medium (<20%)' })
  severity: 'critical' | 'high' | 'medium';

  @ApiProperty()
  detectedAt: Date;
}

/**
 * Alert for increasing negative reviews
 */
export class NegativeReviewsTrendAlertDto {
  @ApiProperty({ description: 'Number of negative reviews (<=2 stars) in last 7 days' })
  last7DaysCount: number;

  @ApiProperty({ description: 'Number of negative reviews in previous 7 days' })
  previous7DaysCount: number;

  @ApiProperty({ description: 'Percentage increase' })
  increasePercentage: number;

  @ApiProperty({ description: 'Average rating in last 7 days' })
  avgRatingLast7Days: number;

  @ApiProperty({ description: 'Most common negative review reasons' })
  topNegativeReasons: string[];

  @ApiProperty({ description: 'Severity level: critical (>100% increase), high (50-100%), medium (<50%)' })
  severity: 'critical' | 'high' | 'medium';

  @ApiProperty()
  detectedAt: Date;
}

/**
 * Combined alerts response
 */
export class GetAlertsResponseDto {
  @ApiProperty({ type: [HighCancellationEmployerAlertDto] })
  highCancellationEmployers: HighCancellationEmployerAlertDto[];

  @ApiProperty({ type: [NoShowWorkerAlertDto] })
  noShowWorkers: NoShowWorkerAlertDto[];

  @ApiProperty({ type: UnfulfilledDemandAlertDto })
  unfulfilledDemand: UnfulfilledDemandAlertDto | null;

  @ApiProperty({ type: NegativeReviewsTrendAlertDto })
  negativeReviewsTrend: NegativeReviewsTrendAlertDto | null;

  @ApiProperty({
    description: 'Total count of critical alerts',
  })
  criticalAlertsCount: number;

  @ApiProperty({
    description: 'Total count of high severity alerts',
  })
  highAlertsCount: number;

  @ApiProperty()
  detectedAt: Date;
}
