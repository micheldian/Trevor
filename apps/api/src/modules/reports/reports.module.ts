import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Report } from './entities/report.entity';
import { ReportsController } from './reports.controller';
import { ReportsService } from './services/reports.service';
import { AdminReportsService } from './services/admin-reports.service';
import { AuditLogModule } from '../audit-log/audit-log.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Report]),
    AuditLogModule,
  ],
  controllers: [ReportsController],
  providers: [ReportsService, AdminReportsService],
  exports: [ReportsService, AdminReportsService],
})
export class ReportsModule {}
