import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CreateReportDto } from './dto/create-report.dto';

@Injectable()
export class ReportsService {
  constructor(private readonly database: DatabaseService) {}

  async createReport(userId: string, dto: CreateReportDto) {
    return this.database.report.create({
      data: {
        userId,
        reportedType: dto.reportedType,
        reportedId: dto.reportedId,
        content: dto.content,
      },
    });
  }

  async listReports() {
    return this.database.report.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, username: true, email: true } },
      },
    });
  }
}
