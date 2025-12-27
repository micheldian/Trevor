import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Report, ReportStatus } from '../entities/report.entity';
import { CreateReportDto } from '../dto/create-report.dto';
import { ReportResponseDto } from '../dto/report-response.dto';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Report)
    private readonly reportRepository: Repository<Report>,
  ) {}

  /**
   * Create a new report
   */
  async createReport(
    createReportDto: CreateReportDto,
    reporterId: string,
  ): Promise<ReportResponseDto> {
    // Validate that user is not reporting themselves
    if (createReportDto.targetType === 'user' && createReportDto.targetId === reporterId) {
      throw new BadRequestException('Cannot report yourself');
    }

    // Create the report
    const report = this.reportRepository.create({
      ...createReportDto,
      reporterId,
      status: ReportStatus.OPEN,
    });

    const savedReport = await this.reportRepository.save(report);
    return this.mapToDto(savedReport);
  }

  /**
   * Get all reports created by a user
   */
  async getMyReports(userId: string): Promise<ReportResponseDto[]> {
    const reports = await this.reportRepository.find({
      where: { reporterId: userId },
      order: { createdAt: 'DESC' },
    });

    return reports.map(report => this.mapToDto(report));
  }

  /**
   * Get a single report by ID (only if user is the reporter)
   */
  async getMyReportById(reportId: string, userId: string): Promise<ReportResponseDto> {
    const report = await this.reportRepository.findOne({
      where: { id: reportId, reporterId: userId },
    });

    if (!report) {
      throw new NotFoundException('Report not found');
    }

    return this.mapToDto(report);
  }

  /**
   * Map Report entity to DTO
   */
  private mapToDto(report: Report): ReportResponseDto {
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
    };
  }
}
