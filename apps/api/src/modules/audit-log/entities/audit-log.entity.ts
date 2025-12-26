import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

/**
 * Audit Log Entity
 *
 * Tracks all important actions in the system with before/after snapshots
 */
@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'actor_user_id', nullable: true })
  actorUserId?: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'actor_user_id' })
  actor?: User;

  @Column({ length: 100 })
  action: string;

  @Column({ name: 'entity_type', length: 50 })
  entityType: string;

  @Column({ name: 'entity_id', type: 'uuid', nullable: true })
  entityId?: string;

  @Column({ name: 'before_json', type: 'jsonb', nullable: true })
  beforeJson?: Record<string, any>;

  @Column({ name: 'after_json', type: 'jsonb', nullable: true })
  afterJson?: Record<string, any>;

  @Column({ name: 'ip_address', length: 45, nullable: true })
  ipAddress?: string;

  @Column({ name: 'user_agent', type: 'text', nullable: true })
  userAgent?: string;

  @Column({ name: 'request_method', length: 10, nullable: true })
  requestMethod?: string;

  @Column({ name: 'request_url', type: 'text', nullable: true })
  requestUrl?: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;

  @Column({ length: 20, default: 'success' })
  status: 'success' | 'failed' | 'partial';

  @Column({ name: 'error_message', type: 'text', nullable: true })
  errorMessage?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
