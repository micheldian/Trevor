import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ReportsService } from './services/reports.service';
import { CreateReportDto } from './dto/create-report.dto';
import { ReportResponseDto } from './dto/report-response.dto';

@ApiTags('reports')
@Controller('reports')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  /**
   * Create a new report
   */
  @Post()
  @ApiOperation({
    summary: 'Create a report',
    description: `
      Report inappropriate content or behavior.

      You can report:
      - Users (spam accounts, fake profiles)
      - Reviews (inappropriate comments, harassment)
      - Jobs (scams, fake offers)
      - Profiles (misleading information)

      Reports are reviewed by administrators.
    `,
  })
  @ApiResponse({
    status: 201,
    description: 'Report created successfully',
    type: ReportResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Cannot report yourself',
  })
  async createReport(
    @Body() createReportDto: CreateReportDto,
    @Request() req: any,
  ): Promise<ReportResponseDto> {
    const userId = req.user?.userId;
    return this.reportsService.createReport(createReportDto, userId);
  }

  /**
   * Get all reports created by the current user
   */
  @Get('my')
  @ApiOperation({
    summary: 'Get my reports',
    description: 'Get all reports created by the authenticated user',
  })
  @ApiResponse({
    status: 200,
    description: 'List of reports',
    type: [ReportResponseDto],
  })
  async getMyReports(@Request() req: any): Promise<ReportResponseDto[]> {
    const userId = req.user?.userId;
    return this.reportsService.getMyReports(userId);
  }

  /**
   * Get a specific report by ID (only if user is the reporter)
   */
  @Get('my/:reportId')
  @ApiOperation({
    summary: 'Get my report by ID',
    description: 'Get details of a specific report created by the authenticated user',
  })
  @ApiResponse({
    status: 200,
    description: 'Report details',
    type: ReportResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Report not found',
  })
  async getMyReportById(
    @Param('reportId') reportId: string,
    @Request() req: any,
  ): Promise<ReportResponseDto> {
    const userId = req.user?.userId;
    return this.reportsService.getMyReportById(reportId, userId);
  }
}
