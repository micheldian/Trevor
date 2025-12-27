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

export enum ReportTargetType {
  USER = 'user',
  REVIEW = 'review',
  JOB = 'job',
  PROFILE = 'profile',
}

export enum ReportReason {
  SPAM = 'spam',
  INAPPROPRIATE = 'inappropriate',
  HARASSMENT = 'harassment',
  FAKE = 'fake',
  SCAM = 'scam',
  OTHER = 'other',
}

export enum ReportStatus {
  OPEN = 'open',
  IN_REVIEW = 'in_review',
  CLOSED = 'closed',
  DISMISSED = 'dismissed',
}

@Entity('reports')
export class Report {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'reporter_id', type: 'uuid' })
  reporterId: string;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'reporter_id' })
  reporter: User;

  @Column({
    name: 'target_type',
    type: 'enum',
    enum: ReportTargetType,
  })
  targetType: ReportTargetType;

  @Column({ name: 'target_id', type: 'uuid' })
  targetId: string;

  @Column({
    type: 'enum',
    enum: ReportReason,
  })
  reason: ReportReason;

  @Column({ type: 'text', nullable: true })
  note?: string | null;

  @Column({
    type: 'enum',
    enum: ReportStatus,
    default: ReportStatus.OPEN,
  })
  status: ReportStatus;

  @Column({ name: 'resolution_note', type: 'text', nullable: true })
  resolutionNote?: string | null;

  @Column({ name: 'resolved_by', type: 'uuid', nullable: true })
  resolvedById?: string | null;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'resolved_by' })
  resolvedBy?: User;

  @Column({ name: 'resolved_at', type: 'timestamp', nullable: true })
  resolvedAt?: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
