import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { AdminUsersService } from './services/admin-users.service';
import { AdminIpLockService } from './services/admin-ip-lock.service';
import { AdminRateLimitGuard } from './guards/admin-rate-limit.guard';
import { AdminIpLockGuard } from './guards/admin-ip-lock.guard';
import { AdminFailureInterceptor } from './interceptors/admin-failure.interceptor';
import { User } from '../users/entities/user.entity';
import { Profile } from '../profiles/entities/profile.entity';
import { Job } from '../jobs/entities/job.entity';
import { Match } from '../matches/entities/match.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Profile, Job, Match])],
  controllers: [AdminController],
  providers: [
    AdminService,
    AdminUsersService,
    AdminIpLockService,
    AdminRateLimitGuard,
    AdminIpLockGuard,
    AdminFailureInterceptor,
  ],
  exports: [
    AdminService,
    AdminUsersService,
    AdminIpLockService,
    AdminRateLimitGuard,
    AdminIpLockGuard,
    AdminFailureInterceptor,
  ],
})
export class AdminModule {}
