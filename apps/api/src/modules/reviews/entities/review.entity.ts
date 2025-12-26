import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Unique,
} from 'typeorm';
import { Match } from '../../matches/entities/match.entity';
import { Profile } from '../../profiles/entities/profile.entity';
import { User } from '../../users/entities/user.entity';

@Entity('reviews')
@Unique('unique_match_reviewer', ['matchId', 'reviewerId'])
export class Review {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'match_id', type: 'uuid' })
  matchId: string;

  @ManyToOne(() => Match)
  @JoinColumn({ name: 'match_id' })
  match: Match;

  @Column({ name: 'reviewer_id', type: 'uuid' })
  reviewerId: string;

  @ManyToOne(() => Profile)
  @JoinColumn({ name: 'reviewer_id' })
  reviewer: Profile;

  @Column({ name: 'reviewed_id', type: 'uuid' })
  reviewedId: string;

  @ManyToOne(() => Profile)
  @JoinColumn({ name: 'reviewed_id' })
  reviewed: Profile;

  // Rating principal (1-5 étoiles)
  @Column({ type: 'decimal', precision: 2, scale: 1 })
  rating: number;

  // Critères spécifiques
  @Column({ type: 'decimal', precision: 2, scale: 1, nullable: true })
  professionalism?: number;

  @Column({ type: 'decimal', precision: 2, scale: 1, nullable: true })
  punctuality?: number;

  @Column({ type: 'decimal', precision: 2, scale: 1, nullable: true })
  communication?: number;

  @Column({ type: 'decimal', precision: 2, scale: 1, nullable: true })
  quality?: number;

  // Texte du review
  @Column({ type: 'text', nullable: true })
  comment?: string;

  // Problèmes de fiabilité
  @Column({ name: 'was_no_show', type: 'boolean', default: false })
  wasNoShow: boolean;

  @Column({ name: 'was_cancelled', type: 'boolean', default: false })
  wasCancelled: boolean;

  @Column({ name: 'cancellation_reason', type: 'text', nullable: true })
  cancellationReason?: string;

  // Recommandation
  @Column({ name: 'would_work_again', type: 'boolean', nullable: true })
  wouldWorkAgain?: boolean;

  // Moderation fields
  @Column({ name: 'is_hidden', type: 'boolean', default: false })
  isHidden: boolean;

  @Column({ name: 'hidden_reason', type: 'text', nullable: true })
  hiddenReason?: string | null;

  @Column({ name: 'hidden_at', type: 'timestamp', nullable: true })
  hiddenAt?: Date | null;

  @Column({ name: 'hidden_by', type: 'uuid', nullable: true })
  hiddenById?: string | null;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'hidden_by' })
  hiddenBy?: User;

  @Column({ name: 'is_flagged', type: 'boolean', default: false })
  isFlagged: boolean;

  @Column({ name: 'flag_reason', type: 'text', nullable: true })
  flagReason?: string | null;

  @Column({ name: 'flagged_at', type: 'timestamp', nullable: true })
  flaggedAt?: Date | null;

  @Column({ name: 'flagged_by', type: 'uuid', nullable: true })
  flaggedById?: string | null;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'flagged_by' })
  flaggedBy?: User;

  @Column({ name: 'moderated_by', type: 'uuid', nullable: true })
  moderatedById?: string | null;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'moderated_by' })
  moderatedBy?: User;

  @Column({ name: 'moderated_at', type: 'timestamp', nullable: true })
  moderatedAt?: Date | null;

  // Métadonnées
  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt?: Date | null;
}
