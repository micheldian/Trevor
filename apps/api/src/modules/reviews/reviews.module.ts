import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReviewsController } from './reviews.controller';
import { ReviewsService } from './reviews.service';
import { Review } from './entities/review.entity';
import { Match } from '../matches/entities/match.entity';
import { Profile } from '../profiles/entities/profile.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Review, Match, Profile])],
  controllers: [ReviewsController],
  providers: [ReviewsService],
  exports: [ReviewsService],
})
export class ReviewsModule {}
