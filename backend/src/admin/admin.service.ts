import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
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
    include: {
      user: { select: { id: true, username: true, avatar: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  // For each report, fetch the reported entity
  const enriched = await Promise.all(
    reports.map(async (report) => {
      let content = '';
      let creatorName = '';
      if (report.reportedType === 'QUEST') {
        const quest = await this.database.prisma.quest.findUnique({
          where: { id: report.reportedId },
          include: { creator: { select: { username: true } } },
        });
        content = quest?.title || 'Deleted quest';
        creatorName = quest?.creator?.username || 'Unknown';
      } else if (report.reportedType === 'COMMENT') {
        const comment = await this.database.prisma.comment.findUnique({
          where: { id: report.reportedId },
          include: { user: { select: { username: true } } },
        });
        content = comment?.content || 'Deleted comment';
        creatorName = comment?.user?.username || 'Unknown';
      }
      return {
        id: report.id,
        type: report.reportedType.toLowerCase(),
        content,                     // the actual reported text/title
        creatorName,
        userId: report.user.id,
        userName: report.user.username,
        reportedAt: report.createdAt,
        reason: report.content,      // the report reason
      };
    }),
  );

  return enriched;
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