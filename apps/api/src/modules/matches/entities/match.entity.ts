import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Unique,
} from 'typeorm';
import { Job } from '../../jobs/entities/job.entity';
import { Profile } from '../../profiles/entities/profile.entity';

export enum MatchStatus {
  DISCUSSED = 'discussed',
  INTERESTED = 'interested',
  REJECTED = 'rejected',
  CONFIRMED = 'confirmed',
  COMPLETED = 'completed',
}

@Entity('matches')
@Unique('unique_job_candidate', ['jobId', 'candidateId'])
export class Match {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'job_id', type: 'uuid' })
  jobId: string;

  @ManyToOne(() => Job, { eager: true })
  @JoinColumn({ name: 'job_id' })
  job: Job;

  @Column({ name: 'candidate_id', type: 'uuid' })
  candidateId: string;

  @ManyToOne(() => Profile, { eager: true })
  @JoinColumn({ name: 'candidate_id' })
  candidate: Profile;

  @Column({
    type: 'enum',
    enum: MatchStatus,
    default: MatchStatus.DISCUSSED,
  })
  status: MatchStatus;

  @Column({ name: 'employer_notes', type: 'text', nullable: true })
  employerNotes?: string;

  @Column({ name: 'candidate_notes', type: 'text', nullable: true })
  candidateNotes?: string;

  @Column({ name: 'whatsapp_contacted', type: 'boolean', default: false })
  whatsappContacted: boolean;

  @Column({ name: 'whatsapp_contacted_at', type: 'timestamp', nullable: true })
  whatsappContactedAt?: Date;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ name: 'interested_at', type: 'timestamp', nullable: true })
  interestedAt?: Date;

  @Column({ name: 'rejected_at', type: 'timestamp', nullable: true })
  rejectedAt?: Date;

  @Column({ name: 'confirmed_at', type: 'timestamp', nullable: true })
  confirmedAt?: Date;

  @Column({ name: 'completed_at', type: 'timestamp', nullable: true })
  completedAt?: Date;
}
