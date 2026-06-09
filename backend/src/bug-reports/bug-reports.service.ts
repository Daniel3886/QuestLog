import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CreateBugReportDto } from './dto/create-bug-report.dto';

@Injectable()
export class BugReportsService {
  constructor(private database: DatabaseService) {}

  async getUserReports(userId: string) {
    return this.database.prisma.bugReport.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createReport(userId: string, dto: CreateBugReportDto) {
  try {
    return await this.database.prisma.bugReport.create({
      data: {
        userId,
        description: dto.description,
        status: 'new',
      },
    });
  } catch (error) {
    console.error('Error creating bug report:', error);
    throw error;
  }
}
}