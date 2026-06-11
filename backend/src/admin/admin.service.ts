import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { BanUserDto } from './dto/ban-user.dto';
import { UpdateBugReportDto } from './dto/update-bug-report.dto';
import { EventsService } from '../events/events.service';
import { CreateEventDto } from '../events/dto/create-event.dto';
import { UpdateEventDto } from '../events/dto/update-event.dto';

@Injectable()
export class AdminService {
  constructor(
    private database: DatabaseService,
    private eventsService: EventsService,
  ) {}

  // ========== Reports ==========
  async getReports() {
    const reports = await this.database.prisma.report.findMany({
      include: { user: { select: { id: true, username: true } } },
      orderBy: { createdAt: 'desc' },
    });

    const enriched = await Promise.all(reports.map(async (report) => {
      let content = '';
      let creatorName = '';
      let creatorId = '';
      let questDescription = '';

      if (report.reportedType === 'QUEST') {
        const quest = await this.database.prisma.quest.findUnique({
          where: { id: report.reportedId },
          include: { creator: { select: { id: true, username: true } } },
        });
        content = quest?.title || 'Deleted quest';
        questDescription = quest?.description || '';
        creatorName = quest?.creator?.username || 'Unknown';
        creatorId = quest?.creator?.id || '';
      } else if (report.reportedType === 'COMMENT') {
        const comment = await this.database.prisma.comment.findUnique({
          where: { id: report.reportedId },
          include: { user: { select: { id: true, username: true } } },
        });
        content = comment?.content || 'Deleted comment';
        creatorName = comment?.user?.username || 'Unknown';
        creatorId = comment?.user?.id || '';
      }

      return {
        id: report.id,
        type: report.reportedType.toLowerCase(),
        content,
        questDescription, // new field
        creatorName,
        creatorId,
        reportedAt: report.createdAt,
        reason: report.content,
        reporterId: report.userId,
        reporterName: report.user.username,
      };
    }));

    return enriched;
  }
  
  async deleteReport(reportId: string) {
    await this.database.prisma.report.delete({ where: { id: reportId } });
    return { success: true };
  }

  async deleteQuest(reportId: string) {
    const report = await this.database.prisma.report.findUnique({ where: { id: reportId } });
    if (!report) {
      throw new NotFoundException(`Report with ID ${reportId} not found`);
    }
    if (report.reportedType !== 'QUEST') {
      throw new BadRequestException('This report does not correspond to a quest');
    }
    const questId = report.reportedId;
    const quest = await this.database.prisma.quest.findUnique({ where: { id: questId } });
    if (!quest) {
      throw new NotFoundException(`Quest with ID ${questId} not found`);
    }
    await this.database.prisma.quest.delete({ where: { id: questId } });
    // Also delete the report itself
    await this.database.prisma.report.delete({ where: { id: reportId } });
    return { success: true };
  }

  // ========== User Ban ==========
  async banUser(adminId: string, userId: string, dto: BanUserDto) {
    // Optional: verify admin exists (but guard already checks)
    const user = await this.database.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    if (user.isBanned) throw new ForbiddenException('User already banned');

    await this.database.prisma.user.update({
      where: { id: userId },
      data: {
        isBanned: true,
        bannedReason: dto.reason,
        bannedAt: new Date(),
      },
    });

    // Optionally delete reported item if reportedItemId provided?
    // For simplicity, just record the ban.

    return { success: true };
  }

  async unbanUser(adminId: string, userId: string) {
    const user = await this.database.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    if (!user.isBanned) throw new ForbiddenException('User is not banned');

    await this.database.prisma.user.update({
      where: { id: userId },
      data: { isBanned: false, bannedReason: null, bannedAt: null },
    });
    return { success: true };
  }

  async getBannedUsers() {
    return this.database.prisma.user.findMany({
      where: { isBanned: true },
      select: {
        id: true,
        username: true,
        bannedReason: true,
        bannedAt: true,
      },
    });
  }

  // ========== Event Management (Admin) ==========
  async createEvent(adminId: string, dto: CreateEventDto) {
    return this.eventsService.create(dto);
  }

  async updateEvent(adminId: string, eventId: string, dto: UpdateEventDto) {
    return this.eventsService.update(eventId, dto);
  }

  async deleteEvent(adminId: string, eventId: string) {
    return this.eventsService.delete(eventId);
  }

  async getAllEvents() {
    return this.eventsService.findAll();
  }

  // ========== Bug Reports (Admin view) ==========
  async getAllBugReports() {
    return this.database.prisma.bugReport.findMany({
      include: {
        user: { select: { id: true, username: true, avatar: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateBugReport(adminId: string, reportId: string, dto: UpdateBugReportDto) {
    const report = await this.database.prisma.bugReport.findUnique({ where: { id: reportId } });
    if (!report) throw new NotFoundException('Bug report not found');

    return this.database.prisma.bugReport.update({
      where: { id: reportId },
      data: {
        status: dto.status,
        answer: dto.answer,
      },
    });
  }
}