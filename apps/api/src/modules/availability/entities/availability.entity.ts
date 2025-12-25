import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Profile } from '../../profiles/entities/profile.entity';

export enum AvailabilityStatus {
  ON = 'on',
  OFF = 'off',
}

export enum DateType {
  TODAY = 'today',
  TOMORROW = 'tomorrow',
}

export enum TimeSlot {
  MORNING = 'morning',     // 08:00-12:00
  AFTERNOON = 'afternoon', // 14:00-18:00
  DAY = 'day',            // 08:00-18:00
}

@Entity('availabilities')
export class Availability {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'profile_id' })
  profileId: string;

  @ManyToOne(() => Profile, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'profile_id' })
  profile: Profile;

  @Column({
    type: 'enum',
    enum: AvailabilityStatus,
    default: AvailabilityStatus.ON,
  })
  status: AvailabilityStatus;

  @Column({
    name: 'date_type',
    type: 'enum',
    enum: DateType,
  })
  dateType: DateType;

  @Column({
    name: 'time_slot',
    type: 'enum',
    enum: TimeSlot,
  })
  timeSlot: TimeSlot;

  // Géolocalisation
  @Column({ type: 'decimal', precision: 10, scale: 7 })
  latitude: number;

  @Column({ type: 'decimal', precision: 10, scale: 7 })
  longitude: number;

  @Column({ name: 'radius_km', type: 'integer', default: 50 })
  radiusKm: number;

  // Métadonnées
  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  // Booking (anti double-booking)
  @Column({ name: 'booked_by_match_id', type: 'uuid', nullable: true })
  bookedByMatchId?: string;

  @Column({ name: 'booked_at', type: 'timestamp', nullable: true })
  bookedAt?: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
