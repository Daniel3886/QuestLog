import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { User } from 'src/auth/decorators/user.decorator';
import type { AuthUser } from 'src/auth/types/auth-user.type';
import { CreateReportDto } from './dto/create-report.dto';
import { ReportsService } from './reports.service';

@UseGuards(JwtAuthGuard)
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Post()
  createReport(@User() user: AuthUser, @Body() dto: CreateReportDto) {
    return this.reportsService.createReport(user.id, dto);
  }
}
