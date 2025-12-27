import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SearchService } from './search.service';
import { SearchController } from './search.controller';
import { Availability } from '../availability/entities/availability.entity';
import { Profile } from '../profiles/entities/profile.entity';
import { Tag } from '../tags/entities/tag.entity';
import { TagAlias } from '../tags/entities/tag-alias.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Availability, Profile, Tag, TagAlias])],
  controllers: [SearchController],
  providers: [SearchService],
  exports: [SearchService],
})
export class SearchModule {}
