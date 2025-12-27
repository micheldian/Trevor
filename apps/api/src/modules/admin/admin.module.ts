import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { AdminUsersService } from './services/admin-users.service';
import { AdminReviewsService } from './services/admin-reviews.service';
import { AdminJobsService } from './services/admin-jobs.service';
import { AdminMatchesService } from './services/admin-matches.service';
import { AdminConflictsService } from './services/admin-conflicts.service';
import { AdminIpLockService } from './services/admin-ip-lock.service';
import { AdminRateLimitGuard } from './guards/admin-rate-limit.guard';
import { AdminIpLockGuard } from './guards/admin-ip-lock.guard';
import { AdminFailureInterceptor } from './interceptors/admin-failure.interceptor';
import { AuditLogModule } from '../audit-log/audit-log.module';
import { ReportsModule } from '../reports/reports.module';
import { TagsModule } from '../tags/tags.module';
import { User } from '../users/entities/user.entity';
import { Profile } from '../profiles/entities/profile.entity';
import { Job } from '../jobs/entities/job.entity';
import { Match } from '../matches/entities/match.entity';
import { Review } from '../reviews/entities/review.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Profile, Job, Match, Review]),
    AuditLogModule,
    ReportsModule,
    TagsModule,
  ],
  controllers: [AdminController],
  providers: [
    AdminService,
    AdminUsersService,
    AdminReviewsService,
    AdminJobsService,
    AdminMatchesService,
    AdminConflictsService,
    AdminIpLockService,
    AdminRateLimitGuard,
    AdminIpLockGuard,
    AdminFailureInterceptor,
  ],
  exports: [
    AdminService,
    AdminUsersService,
    AdminReviewsService,
    AdminJobsService,
    AdminMatchesService,
    AdminConflictsService,
    AdminIpLockService,
    AdminRateLimitGuard,
    AdminIpLockGuard,
    AdminFailureInterceptor,
  ],
})
export class AdminModule {}
