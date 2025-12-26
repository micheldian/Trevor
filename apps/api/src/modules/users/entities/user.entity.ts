import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Profile } from '../../profiles/entities/profile.entity';
import { Role } from '../../../common/enums/role.enum';
import { UserStatus } from '../../../common/enums/user-status.enum';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, nullable: true })
  email?: string;

  @Column({ unique: true, nullable: true, length: 20 })
  phone?: string;

  @Column({ name: 'is_phone_verified', default: false })
  isPhoneVerified: boolean;

  @Column({ name: 'is_email_verified', default: false })
  isEmailVerified: boolean;

  @Column({
    type: 'enum',
    enum: Role,
    default: Role.WORKER,
  })
  role: Role;

  @Column({ name: 'first_name', nullable: true, length: 100 })
  firstName?: string;

  @Column({ name: 'last_name', nullable: true, length: 100 })
  lastName?: string;

  @Column({ name: 'avatar_url', nullable: true, length: 500 })
  avatarUrl?: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'is_verified', default: false })
  isVerified: boolean;

  @Column({ name: 'verified_at', nullable: true, type: 'timestamp' })
  verifiedAt?: Date;

  @Column({ name: 'verified_by', nullable: true })
  verifiedById?: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'verified_by' })
  verifiedBy?: User;

  @Column({
    type: 'enum',
    enum: UserStatus,
    default: UserStatus.ACTIVE,
  })
  status: UserStatus;

  @Column({ name: 'suspend_reason', nullable: true, type: 'text' })
  suspendReason?: string;

  @Column({ name: 'suspend_until', nullable: true, type: 'timestamp' })
  suspendUntil?: Date;

  @Column({ name: 'suspended_at', nullable: true, type: 'timestamp' })
  suspendedAt?: Date;

  @Column({ name: 'suspended_by', nullable: true })
  suspendedById?: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'suspended_by' })
  suspendedBy?: User;

  @Column({ name: 'banned_at', nullable: true, type: 'timestamp' })
  bannedAt?: Date;

  @Column({ name: 'banned_by', nullable: true })
  bannedById?: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'banned_by' })
  bannedBy?: User;

  @Column({ name: 'last_login_at', nullable: true, type: 'timestamp' })
  lastLoginAt?: Date;

  @Column({ name: 'last_seen_at', nullable: true, type: 'timestamp' })
  lastSeenAt?: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => Profile, (profile) => profile.user)
  profiles?: Profile[];
}
