import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { $Enums } from '@prisma/client';
import { DatabaseService } from '../database/database.service';
import { CreateGuildDto } from './dto/create-guild.dto';
import { CreateGuildQuestDto } from './dto/create-guild-quest.dto';
import { LogGuildProgressDto } from './dto/log-guild-progress.dto';
import { UpdateGuildDto } from './dto/update-guild.dto';
import { applyGuildXp, guildXpToNextLevel } from '../common/progression';

const MAX_GUILD_MEMBERS = 10;

const guildInclude = {
  members: {
    include: {
      user: {
        select: { id: true, username: true, streak: true, avatar: true },
      },
    },
    orderBy: { contribution: 'desc' as const },
  },
  guildQuests: {
    include: {
      quest: {
        include: {
          creator: { select: { username: true } },
        },
      },
      rewardItem: true,
    },
    orderBy: { createdAt: 'desc' as const },
  },
} satisfies Prisma.GuildInclude;

type GuildWithRelations = Prisma.GuildGetPayload<{
  include: typeof guildInclude;
}>;

@Injectable()
export class GuildsService {
  constructor(private readonly database: DatabaseService) {}

  async createGuild(userId: string, dto: CreateGuildDto) {
    const existing = await this.database.prisma.guildMember.findFirst({
      where: { userId },
    });
    if (existing) {
      throw new BadRequestException('You are already in a guild');
    }

    const guild = await this.database.prisma.guild.create({
      data: {
        name: dto.name,
        description: dto.description,
        avatar: dto.avatar ?? '⚔️',
        members: {
          create: { userId, role: $Enums.GuildMemberRole.LEADER },
        },
      },
      include: guildInclude,
    });

    return await this.formatGuild(guild, userId);
  }

  async getMyGuild(userId: string) {
    const membership = await this.database.prisma.guildMember.findFirst({
      where: { userId },
      include: {
        guild: { include: guildInclude },
      },
    });

    if (!membership) {
      return null;
    }

    return await this.formatGuild(membership.guild, userId);
  }

  async getGuild(userId: string, guildId: string) {
    await this.ensureMember(guildId, userId);
    const guild = await this.database.prisma.guild.findUnique({
      where: { id: guildId },
      include: guildInclude,
    });

    if (!guild) {
      throw new NotFoundException('Guild not found');
    }

    return await this.formatGuild(guild, userId);
  }

  async updateGuild(userId: string, guildId: string, dto: UpdateGuildDto) {
    await this.ensureLeader(guildId, userId);

    const guild = await this.database.prisma.guild.update({
      where: { id: guildId },
      data: {
        name: dto.name,
        description: dto.description,
        avatar: dto.avatar,
      },
      include: guildInclude,
    });

    return await this.formatGuild(guild, userId);
  }

  async joinGuild(userId: string, guildId: string) {
    const existing = await this.database.prisma.guildMember.findFirst({
      where: { userId },
    });
    if (existing) {
      throw new BadRequestException('You are already in a guild');
    }

    const guild = await this.database.prisma.guild.findUnique({
      where: { id: guildId },
      include: { members: true },
    });
    if (!guild) {
      throw new NotFoundException('Guild not found');
    }
    if (guild.members.length >= MAX_GUILD_MEMBERS) {
      throw new BadRequestException('Guild is full');
    }

    await this.database.prisma.guildMember.create({
      data: { guildId, userId },
    });

    return this.getGuild(userId, guildId);
  }

  async leaveGuild(userId: string, guildId: string) {
    const member = await this.ensureMember(guildId, userId);
    if (member.role === $Enums.GuildMemberRole.LEADER) {
      const memberCount = await this.database.prisma.guildMember.count({
        where: { guildId },
      });
      if (memberCount > 1) {
        throw new BadRequestException(
          'Transfer leadership before leaving the guild',
        );
      }
      await this.database.prisma.guild.delete({ where: { id: guildId } });
      return { left: true, guildDeleted: true };
    }

    await this.database.prisma.guildMember.delete({ where: { id: member.id } });
    return { left: true, guildDeleted: false };
  }

  async listGuildQuests(userId: string, guildId: string) {
    await this.ensureMember(guildId, userId);

    const quests = await this.database.prisma.guildQuest.findMany({
      where: { guildId },
      include: {
        quest: { include: { creator: { select: { username: true } } } },
        rewardItem: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const memberCount = await this.database.prisma.guildMember.count({
      where: { guildId },
    });

    return quests.map((gq) => this.formatGuildQuest(gq, memberCount));
  }

  async createGuildQuest(
    userId: string,
    guildId: string,
    dto: CreateGuildQuestDto,
  ) {
    await this.ensureMember(guildId, userId);

    const quest = await this.database.prisma.quest.create({
      data: {
        creatorId: userId,
        type: $Enums.QuestType.GUILD,
        title: dto.title,
        description: dto.description,
        trackingType: dto.trackingType,
        unit: dto.unit,
        targetValue: dto.targetValue,
      },
    });

    const guildQuest = await this.database.prisma.guildQuest.create({
      data: {
        guildId,
        questId: quest.id,
        questType: dto.questType,
        rewardGems: dto.rewardGems ?? 0,
        rewardItemId: dto.rewardItemId,
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
      },
      include: {
        quest: { include: { creator: { select: { username: true } } } },
        rewardItem: true,
      },
    });

    const memberCount = await this.database.prisma.guildMember.count({
      where: { guildId },
    });

    return this.formatGuildQuest(guildQuest, memberCount);
  }

  async voteGuildQuest(userId: string, guildId: string, guildQuestId: string) {
    await this.ensureMember(guildId, userId);

    const guildQuest = await this.database.prisma.guildQuest.findFirst({
      where: { id: guildQuestId, guildId },
      include: {
        quest: { include: { creator: { select: { username: true } } } },
        rewardItem: true,
      },
    });
    if (!guildQuest) {
      throw new NotFoundException('Guild quest not found');
    }
    if (guildQuest.status !== $Enums.GuildQuestStatus.DRAFTING) {
      throw new BadRequestException('Quest is not open for voting');
    }

    const memberCount = await this.database.prisma.guildMember.count({
      where: { guildId },
    });
    const votes = guildQuest.votes + 1;
    const activate = votes >= memberCount;

    const updated = await this.database.prisma.guildQuest.update({
      where: { id: guildQuestId },
      data: {
        votes,
        status: activate ? $Enums.GuildQuestStatus.ACTIVE : undefined,
        startDate: activate ? new Date() : undefined,
      },
      include: {
        quest: { include: { creator: { select: { username: true } } } },
        rewardItem: true,
      },
    });

    return this.formatGuildQuest(updated, memberCount);
  }

  async logGuildProgress(
    userId: string,
    guildId: string,
    guildQuestId: string,
    dto: LogGuildProgressDto,
  ) {
    const member = await this.ensureMember(guildId, userId);

    const guildQuest = await this.database.prisma.guildQuest.findFirst({
      where: { id: guildQuestId, guildId },
      include: {
        quest: { include: { creator: { select: { username: true } } } },
        rewardItem: true,
      },
    });
    if (!guildQuest) {
      throw new NotFoundException('Guild quest not found');
    }
    if (guildQuest.status !== $Enums.GuildQuestStatus.ACTIVE) {
      throw new BadRequestException('Quest is not active');
    }

    const newValue = Math.min(
      guildQuest.currentValue + dto.amount,
      guildQuest.quest.targetValue,
    );
    const completed = newValue >= guildQuest.quest.targetValue;

    const [updated] = await this.database.prisma.$transaction([
      this.database.prisma.guildQuest.update({
        where: { id: guildQuestId },
        data: {
          currentValue: newValue,
          status: completed ? $Enums.GuildQuestStatus.COMPLETED : undefined,
        },
        include: {
        quest: { include: { creator: { select: { username: true } } } },
        rewardItem: true,
      },
      }),
      this.database.prisma.guildMember.update({
        where: { id: member.id },
        data: { contribution: { increment: Math.round(dto.amount) } },
      }),
    ]);

    if (completed) {
      const guild = await this.database.prisma.guild.findUnique({
        where: { id: guildId },
      });
      if (guild) {
        const progressed = applyGuildXp(guild.level, guild.xp, 100);
        await this.database.prisma.guild.update({
          where: { id: guildId },
          data: {
            gems: { increment: guildQuest.rewardGems },
            level: progressed.level,
            xp: progressed.xp,
          },
        });
      }
    }

    const memberCount = await this.database.prisma.guildMember.count({
      where: { guildId },
    });

    return this.formatGuildQuest(updated, memberCount);
  }

  private async formatGuild(guild: GuildWithRelations, userId: string) {
    const memberCount = guild.members.length;
    const xpNext = guildXpToNextLevel(guild.level);
    const badges = await this.getGuildBadges(guild.id);

    return {
      id: guild.id,
      name: guild.name,
      description: guild.description,
      avatar: guild.avatar,
      level: guild.level,
      xp: guild.xp,
      xpNext,
      gems: guild.gems,
      createdAt: guild.createdAt,
      members: guild.members.map((m) => ({
        id: m.id,
        userId: m.userId,
        username: m.user.username,
        avatar: m.user.avatar,
        role: m.role.toLowerCase(),
        joinedAt: m.joinedAt,
        contribution: m.contribution,
        streak: m.user.streak,
      })),
      activeQuests: guild.guildQuests
        .filter((gq) => gq.status !== $Enums.GuildQuestStatus.COMPLETED)
        .map((gq) => this.formatGuildQuest(gq, memberCount)),
      completedQuests: guild.guildQuests
        .filter((gq) => gq.status === $Enums.GuildQuestStatus.COMPLETED)
        .map((gq) => this.formatGuildQuest(gq, memberCount)),
      badges,
      currentUserRole: guild.members
        .find((m) => m.userId === userId)
        ?.role.toLowerCase(),
    };
  }

  private formatGuildQuest(guildQuest: GuildWithRelations['guildQuests'][number], memberCount: number) {
    return {
      id: guildQuest.id,
      questId: guildQuest.questId,
      title: guildQuest.quest.title,
      description: guildQuest.quest.description,
      type: guildQuest.questType.toLowerCase(),
      trackingType: guildQuest.quest.trackingType.toLowerCase(),
      targetValue: guildQuest.quest.targetValue,
      currentValue: guildQuest.currentValue,
      unit: guildQuest.quest.unit ?? 'times',
      status: guildQuest.status.toLowerCase(),
      votes: guildQuest.votes,
      totalMembers: memberCount,
      startDate: guildQuest.startDate,
      endDate: guildQuest.endDate,
      rewardGems: guildQuest.rewardGems,
      rewardItemName: guildQuest.rewardItem?.name ?? null,
      createdBy: guildQuest.quest.creator?.username ?? 'Unknown',
      createdAt: guildQuest.createdAt,
    };
  }

  private async getGuildBadges(guildId: string) {
    const entries = await this.database.prisma.inventory.findMany({
      where: {
        ownerId: guildId,
        ownerType: $Enums.OwnerType.GUILD,
        item: { type: $Enums.ItemType.BADGE },
      },
      include: { item: true },
      orderBy: { createdAt: 'asc' },
    });

    return entries.map((entry) => ({
      id: entry.id,
      name: entry.item.name,
      description: entry.item.description ?? '',
      icon: entry.item.icon,
      earnedAt: entry.createdAt,
    }));
  }

  private async ensureMember(guildId: string, userId: string) {
    const member = await this.database.prisma.guildMember.findFirst({
      where: { guildId, userId },
    });
    if (!member) {
      throw new ForbiddenException('Not a member of this guild');
    }
    return member;
  }

  private async ensureLeader(guildId: string, userId: string) {
    const member = await this.ensureMember(guildId, userId);
    if (member.role !== $Enums.GuildMemberRole.LEADER) {
      throw new ForbiddenException('Guild leader access required');
    }
    return member;
  }
}
