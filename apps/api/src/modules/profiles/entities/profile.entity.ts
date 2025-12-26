import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum ProfileType {
  WORKER = 'worker',
  TEAM_LEAD = 'team_lead',
  EMPLOYER = 'employer',
}

@Entity('profiles')
export class Profile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => User, (user) => user.profiles)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({
    name: 'profile_type',
    type: 'enum',
    enum: ProfileType,
  })
  type: ProfileType;

  @Column({ type: 'text', nullable: true })
  bio?: string;

  @Column({ name: 'company_name', nullable: true, length: 255 })
  companyName?: string;

  @Column({ nullable: true, length: 14 })
  siret?: string;

  @Column({ length: 100 })
  city: string;

  @Column({ name: 'postal_code', length: 5, default: '67000' })
  postalCode: string;

  @Column({ type: 'text', nullable: true })
  address?: string;

  @Column({ type: 'simple-array', nullable: true })
  skills?: string[];

  @Column({ name: 'experience_years', default: 0 })
  experienceYears: number;

  @Column({ type: 'simple-array', nullable: true })
  certifications?: string[];

  @Column({ name: 'whatsapp_number', nullable: true, length: 20 })
  whatsappNumber?: string;

  @Column({ name: 'preferred_contact', default: 'whatsapp', length: 20 })
  preferredContact: string;

  @Column({ name: 'rating_avg', type: 'decimal', precision: 3, scale: 2, default: 0 })
  ratingAvg: number;

  @Column({ name: 'rating_count', default: 0 })
  ratingCount: number;

  @Column({ name: 'missions_count', default: 0 })
  missionsCount: number;

  @Column({ name: 'completed_missions_count', default: 0 })
  completedMissionsCount: number;

  @Column({ name: 'no_show_count', default: 0 })
  noShowCount: number;

  @Column({ name: 'cancelled_count', default: 0 })
  cancelledCount: number;

  @Column({ name: 'reliability_score', type: 'decimal', precision: 5, scale: 2, default: 100 })
  reliabilityScore: number;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'is_complete', default: false })
  isComplete: boolean;

  // Véhicule
  @Column({ name: 'has_vehicle', default: false })
  hasVehicle: boolean;

  // Localisation par défaut
  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  latitude?: number;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  longitude?: number;

  // PostGIS geography column (managed separately from lat/lng)
  @Column({ type: 'geography', spatialFeatureType: 'Point', srid: 4326, nullable: true })
  location?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
