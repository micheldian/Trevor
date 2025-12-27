import { ApiProperty } from '@nestjs/swagger';

export class TopCultureDto {
  @ApiProperty()
  culture: string;

  @ApiProperty()
  count: number;
}

export class TopEmployerDto {
  @ApiProperty()
  employerId: string;

  @ApiProperty()
  employerName?: string;

  @ApiProperty()
  jobCount: number;

  @ApiProperty()
  confirmedJobCount: number;
}

export class MetricsResponseDto {
  @ApiProperty({ description: 'Number of users active in the last 7 days' })
  activeUsersLast7Days: number;

  @ApiProperty({ description: 'Number of new user registrations in the last 7 days' })
  newRegistrationsLast7Days: number;

  @ApiProperty({ description: 'Number of profiles with availability status ON in real-time' })
  realTimeAvailabilityOn: number;

  @ApiProperty({ description: 'Total number of jobs created' })
  totalJobsCreated: number;

  @ApiProperty({ description: 'Total number of jobs confirmed' })
  totalJobsConfirmed: number;

  @ApiProperty({ description: 'Confirmation rate (percentage of jobs that got confirmed)' })
  confirmationRate: number;

  @ApiProperty({ description: 'No-show rate (percentage of confirmed jobs that were cancelled)' })
  noShowRate: number;

  @ApiProperty({ description: 'Average time from job creation to confirmation in hours' })
  avgTimeToConfirmHours: number;

  @ApiProperty({ type: [TopCultureDto], description: 'Top 10 cultures/tags by usage' })
  topCultures: TopCultureDto[];

  @ApiProperty({ type: [TopEmployerDto], description: 'Top 10 employers by job count' })
  topEmployers: TopEmployerDto[];

  @ApiProperty({ description: 'Timestamp when metrics were calculated' })
  calculatedAt: Date;
}
