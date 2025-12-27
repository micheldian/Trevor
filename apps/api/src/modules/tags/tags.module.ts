import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tag } from './entities/tag.entity';
import { TagAlias } from './entities/tag-alias.entity';
import { AdminTagsService } from './services/admin-tags.service';
import { AuditLogModule } from '../audit-log/audit-log.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Tag, TagAlias]),
    AuditLogModule,
  ],
  providers: [AdminTagsService],
  exports: [AdminTagsService, TypeOrmModule],
})
export class TagsModule {}
