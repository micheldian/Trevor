import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Profile } from '../../profiles/entities/profile.entity';

export enum JobStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  IN_CONTACT = 'in_contact',
  CONFIRMED = 'confirmed',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum JobDateType {
  TODAY = 'today',
  TOMORROW = 'tomorrow',
  THIS_WEEK = 'this_week',
  NEXT_WEEK = 'next_week',
  SPECIFIC_DATE = 'specific_date',
}

export enum JobTimeSlot {
  MORNING = 'morning',
  AFTERNOON = 'afternoon',
  DAY = 'day',
}

export enum JobType {
  FULL_TIME = 'full_time',
  PART_TIME = 'part_time',
  SEASONAL = 'seasonal',
  TEMPORARY = 'temporary',
}

@Entity('jobs')
export class Job {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'employer_id', type: 'uuid' })
  employerId: string;

  @ManyToOne(() => Profile, { eager: true })
  @JoinColumn({ name: 'employer_id' })
  employer: Profile;

  @Column({ type: 'varchar', length: 200 })
  title: string;

  @Column({
    type: 'enum',
    enum: JobType,
    name: 'job_type',
  })
  jobType: JobType;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'varchar', length: 100 })
  culture: string;

  @Column({ type: 'text', array: true, default: [] })
  tags: string[];

  @Column({ name: 'required_skills', type: 'text', array: true, default: [] })
  requiredSkills: string[];

  @Column({
    type: 'enum',
    enum: JobDateType,
    name: 'date_type',
  })
  dateType: JobDateType;

  @Column({ name: 'specific_date', type: 'date', nullable: true })
  specificDate?: Date;

  @Column({
    type: 'enum',
    enum: JobTimeSlot,
    name: 'time_slot',
  })
  timeSlot: JobTimeSlot;

  @Column({ name: 'nb_people', type: 'integer' })
  nbPeople: number;

  @Column({ type: 'decimal', precision: 10, scale: 7 })
  latitude: number;

  @Column({ type: 'decimal', precision: 10, scale: 7 })
  longitude: number;

  // PostGIS geography column (managed separately from lat/lng)
  @Column({ type: 'geography', spatialFeatureType: 'Point', srid: 4326, nullable: true })
  location?: string;

  @Column({ type: 'varchar', length: 200, nullable: true })
  address?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  city?: string;

  @Column({ name: 'postal_code', type: 'varchar', length: 10, nullable: true })
  postalCode?: string;

  @Column({
    type: 'enum',
    enum: JobStatus,
    default: JobStatus.DRAFT,
  })
  status: JobStatus;

  @Column({ name: 'hourly_rate', type: 'decimal', precision: 10, scale: 2, nullable: true })
  hourlyRate?: number;

  @Column({ name: 'estimated_hours', type: 'integer', nullable: true })
  estimatedHours?: number;

  @Column({ name: 'is_urgent', type: 'boolean', default: false })
  isUrgent: boolean;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ name: 'published_at', type: 'timestamp', nullable: true })
  publishedAt?: Date;

  @Column({ name: 'confirmed_at', type: 'timestamp', nullable: true })
  confirmedAt?: Date;

  @Column({ name: 'completed_at', type: 'timestamp', nullable: true })
  completedAt?: Date;

  @Column({ name: 'cancelled_at', type: 'timestamp', nullable: true })
  cancelledAt?: Date;

  @Column({ name: 'cancellation_reason', type: 'text', nullable: true })
  cancellationReason?: string;
}
