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
import { Match } from '../../matches/entities/match.entity';
import { Profile } from '../../profiles/entities/profile.entity';

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

  // Métadonnées
  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
