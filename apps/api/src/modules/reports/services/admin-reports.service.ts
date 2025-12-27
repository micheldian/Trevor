import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Report, ReportStatus } from '../entities/report.entity';
import { UpdateReportStatusDto } from '../dto/update-report-status.dto';
import { GetReportsQueryDto } from '../dto/get-reports-query.dto';
import {
  AdminReportResponseDto,
  PaginatedReportsResponseDto,
  ReporterInfoDto,
} from '../dto/report-response.dto';
import { AuditLogService } from '../../audit-log/audit-log.service';
import { Request } from 'express';

@Injectable()
export class AdminReportsService {
  constructor(
    @InjectRepository(Report)
    private readonly reportRepository: Repository<Report>,
    private readonly auditLogService: AuditLogService,
  ) {}

  /**
   * Get all reports with pagination and filters
   */
  async getReports(query: GetReportsQueryDto): Promise<PaginatedReportsResponseDto> {
    const {
      page = 1,
      limit = 20,
      status,
      targetType,
      reason,
      reporterId,
      targetId,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
    } = query;

    const queryBuilder = this.reportRepository
      .createQueryBuilder('report')
      .leftJoinAndSelect('report.reporter', 'reporter')
      .leftJoinAndSelect('report.resolvedBy', 'resolvedBy');

    // Apply filters
    if (status !== undefined) {
      queryBuilder.andWhere('report.status = :status', { status });
    }

    if (targetType !== undefined) {
      queryBuilder.andWhere('report.targetType = :targetType', { targetType });
    }

    if (reason !== undefined) {
      queryBuilder.andWhere('report.reason = :reason', { reason });
    }

    if (reporterId !== undefined) {
      queryBuilder.andWhere('report.reporterId = :reporterId', { reporterId });
    }

    if (targetId !== undefined) {
      queryBuilder.andWhere('report.targetId = :targetId', { targetId });
    }

    // Sorting
    queryBuilder.orderBy(`report.${sortBy}`, sortOrder);

    // Pagination
    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    const [reports, total] = await queryBuilder.getManyAndCount();

    return {
      data: reports.map(report => this.mapToAdminDto(report)),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get a single report by ID with full details
   */
  async getReport(reportId: string): Promise<AdminReportResponseDto> {
    const report = await this.reportRepository.findOne({
      where: { id: reportId },
      relations: ['reporter', 'resolvedBy'],
    });

    if (!report) {
      throw new NotFoundException('Report not found');
    }

    return this.mapToAdminDto(report);
  }

  /**
   * Update report status
   */
  async updateReportStatus(
    reportId: string,
    dto: UpdateReportStatusDto,
    adminUserId: string,
    request?: Request,
  ): Promise<AdminReportResponseDto> {
    const report = await this.reportRepository.findOne({
      where: { id: reportId },
      relations: ['reporter', 'resolvedBy'],
    });

    if (!report) {
      throw new NotFoundException('Report not found');
    }

    // Validate status transition
    if (report.status === dto.status) {
      throw new BadRequestException(`Report is already ${dto.status}`);
    }

    const beforeState = { ...report };

    // Update status
    report.status = dto.status;
    report.resolutionNote = dto.resolutionNote;

    // Set resolution fields for closed/dismissed status
    if (dto.status === ReportStatus.CLOSED || dto.status === ReportStatus.DISMISSED) {
      report.resolvedById = adminUserId;
      report.resolvedAt = new Date();
    } else {
      // Clear resolution fields if reopening
      report.resolvedById = undefined;
      report.resolvedAt = undefined;
    }

    const updatedReport = await this.reportRepository.save(report);

    // Create audit log
    await this.auditLogService.create({
      actorUserId: adminUserId,
      action: 'reports.status_updated',
      entityType: 'report',
      entityId: report.id,
      beforeJson: beforeState,
      afterJson: updatedReport,
      ipAddress: request?.ip,
      userAgent: request?.headers['user-agent'],
      requestMethod: request?.method,
      requestUrl: request?.url,
      metadata: {
        oldStatus: beforeState.status,
        newStatus: dto.status,
        resolutionNote: dto.resolutionNote,
      },
    });

    return this.mapToAdminDto(updatedReport);
  }

  /**
   * Delete a report (hard delete)
   */
  async deleteReport(
    reportId: string,
    adminUserId: string,
    request?: Request,
  ): Promise<void> {
    const report = await this.reportRepository.findOne({
      where: { id: reportId },
    });

    if (!report) {
      throw new NotFoundException('Report not found');
    }

    // Create audit log before deletion
    await this.auditLogService.create({
      actorUserId: adminUserId,
      action: 'reports.deleted',
      entityType: 'report',
      entityId: report.id,
      beforeJson: report,
      afterJson: undefined,
      ipAddress: request?.ip,
      userAgent: request?.headers['user-agent'],
      requestMethod: request?.method,
      requestUrl: request?.url,
    });

    await this.reportRepository.remove(report);
  }

  /**
   * Get reports statistics
   */
  async getStatistics(): Promise<{
    total: number;
    byStatus: Record<ReportStatus, number>;
    byTargetType: Record<string, number>;
    byReason: Record<string, number>;
  }> {
    const reports = await this.reportRepository.find();

    const byStatus: any = {
      [ReportStatus.OPEN]: 0,
      [ReportStatus.IN_REVIEW]: 0,
      [ReportStatus.CLOSED]: 0,
      [ReportStatus.DISMISSED]: 0,
    };

    const byTargetType: any = {};
    const byReason: any = {};

    reports.forEach(report => {
      byStatus[report.status]++;
      byTargetType[report.targetType] = (byTargetType[report.targetType] || 0) + 1;
      byReason[report.reason] = (byReason[report.reason] || 0) + 1;
    });

    return {
      total: reports.length,
      byStatus,
      byTargetType,
      byReason,
    };
  }

  /**
   * Map Report entity to Admin DTO
   */
  private mapToAdminDto(report: Report): AdminReportResponseDto {
    return {
      id: report.id,
      reporterId: report.reporterId,
      targetType: report.targetType,
      targetId: report.targetId,
      reason: report.reason,
      note: report.note ?? undefined,
      status: report.status,
      resolutionNote: report.resolutionNote ?? undefined,
      resolvedById: report.resolvedById ?? undefined,
      resolvedAt: report.resolvedAt ?? undefined,
      createdAt: report.createdAt,
      updatedAt: report.updatedAt,
      reporter: report.reporter ? this.mapUserToDto(report.reporter) : undefined,
      resolvedBy: report.resolvedBy ? this.mapUserToDto(report.resolvedBy) : undefined,
    };
  }

  /**
   * Map User to simplified DTO
   */
  private mapUserToDto(user: any): ReporterInfoDto {
    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
    };
  }
}
