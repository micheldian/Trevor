import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { TagAlias } from './tag-alias.entity';

export enum TagCategory {
  CULTURE = 'culture',
  SKILL = 'skill',
  CERTIFICATION = 'certification',
  EQUIPMENT = 'equipment',
  OTHER = 'other',
}

@Entity('tags')
export class Tag {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  name: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  slug: string;

  @Column({
    type: 'varchar',
    length: 50,
    nullable: true,
    enum: TagCategory,
  })
  category?: string | null;

  @Column({ type: 'text', nullable: true })
  description?: string | null;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @Column({ name: 'usage_count', type: 'integer', default: 0 })
  usageCount: number;

  @OneToMany(() => TagAlias, (alias) => alias.tag)
  aliases: TagAlias[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
