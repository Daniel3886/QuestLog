import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { User } from '../auth/decorators/user.decorator';
import type { AuthUser } from '../auth/types/auth-user.type';
import { BugReportsService } from './bug-reports.service';
import { CreateBugReportDto } from './dto/create-bug-report.dto';

@Controller('bug-reports')
@UseGuards(JwtAuthGuard)
export class BugReportsController {
  constructor(private bugReportsService: BugReportsService) {}

  @Get()
  getUserReports(@User() user: AuthUser) {
    return this.bugReportsService.getUserReports(user.id);
  }

  @Post()
  createReport(@User() user: AuthUser, @Body() dto: CreateBugReportDto) {
    return this.bugReportsService.createReport(user.id, dto);
  }
}