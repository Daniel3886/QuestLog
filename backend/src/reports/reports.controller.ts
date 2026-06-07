import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { AdminGuard } from 'src/auth/guards/admin.guard';
import { User } from 'src/auth/decorators/user.decorator';
import type { AuthUser } from 'src/auth/types/auth-user.type';
import { CreateReportDto } from './dto/create-report.dto';
import { ReportsService } from './reports.service';

@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  createReport(@User() user: AuthUser, @Body() dto: CreateReportDto) {
    return this.reportsService.createReport(user.id, dto);
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Get()
  listReports() {
    return this.reportsService.listReports();
  }
}
