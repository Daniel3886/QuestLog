import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { Prisma, Quest } from '@prisma/client';
import { $Enums } from '@prisma/client';
import { DatabaseService } from '../database/database.service';
import { QuestDateService } from '../common/quest-date.service';
import { UserProgressService } from '../users/user-progress.service';
import { CreatePublicQuestDto } from './dto/create-public-quest.dto';
import { CreateQuestDto } from './dto/create-quest.dto';
import { UpdateQuestDto } from './dto/update-quest.dto';
import { UpdateQuestProgressDto } from './dto/update-quest-progress.dto';
import { formatPublicQuest } from './quest-format.util';
import { QuestProgressService } from './quest-progress.service';
import { QuestStatsService } from './quest-stats.service';

const MAX_PUBLIC_QUESTS_PER_DAY = 2;

@Injectable()
export class QuestsService {
  constructor(
    private readonly database: DatabaseService,
    private readonly progress: QuestProgressService,
    private readonly stats: QuestStatsService,
    private readonly userProgress: UserProgressService,
    private readonly dates: QuestDateService,
  ) {}

  async createQuest(creatorId: Quest['creatorId'], dto: CreateQuestDto) {
    const data: Prisma.QuestUncheckedCreateInput = {
      creatorId,
      type: $Enums.QuestType.PERSONAL,
      title: dto.title,
      description: dto.description,
      icon: dto.icon ?? '⚔️',
      trackingType: dto.trackingType || undefined,
      unit: dto.unit,
      targetValue: dto.targetValue,
      proofRequired: dto.proofRequired,
      frequency: dto.frequency,
    };
    const quest = await this.database.quest.create({ data });

    return this.stats.withStats(quest);
  }

  async listQuests(creatorId: Quest['creatorId']) {
    const quests = await this.database.quest.findMany({
      where: { creatorId, type: $Enums.QuestType.PERSONAL },
      orderBy: { createdAt: 'desc' },
    });

    const enriched = await Promise.all(
      quests.map((quest) => this.stats.withStats(quest)),
    );

    return enriched.map((q) => q.lobby);
  }

  async getQuest(creatorId: Quest['creatorId'], id: Quest['id']) {
    const quest = await this.getOwnedQuestById(creatorId, id);
    return this.stats.withStats(quest);
  }

  async updateQuest(
    creatorId: Quest['creatorId'],
    id: Quest['id'],
    dto: UpdateQuestDto,
  ) {
    await this.getOwnedQuestById(creatorId, id);

    const data: Prisma.QuestUncheckedUpdateInput = {
      title: dto.title,
      description: dto.description,
      trackingType: dto.trackingType,
      unit: dto.unit,
      targetValue: dto.targetValue,
      proofRequired: dto.proofRequired,
      frequency: dto.frequency,
    };
    const quest = await this.database.quest.update({
      where: { id },
      data,
    });

    return this.stats.withStats(quest);
  }

  async updateQuestProgress(
    userId: Quest['creatorId'],
    id: Quest['id'],
    dto: UpdateQuestProgressDto,
  ) {
    const quest = await this.getOwnedQuestById(userId, id);
    const log = await this.progress.updateProgress(userId, quest, dto);

    return {
      quest: await this.stats.withStats(quest),
      log,
    };
  }

  async resetQuestToday(userId: Quest['creatorId'], id: Quest['id']) {
    const quest = await this.getOwnedQuestById(userId, id);
    const log = await this.progress.resetToday(userId, quest);

    return {
      quest: await this.stats.withStats(quest),
      log,
    };
  }

  async deleteQuest(creatorId: Quest['creatorId'], id: Quest['id']) {
    await this.getOwnedQuestById(creatorId, id);
    await this.database.quest.delete({ where: { id } });

    return { deleted: true };
  }

  async listPublicQuests(
    category?: $Enums.QuestCategory,
    sort: 'popular' | 'newest' | 'difficulty' = 'popular',
  ) {
    const quests = await this.database.quest.findMany({
      where: {
        type: $Enums.QuestType.PUBLIC,
        ...(category ? { category } : {}),
      },
      include: {
        creator: { select: { username: true, avatar: true } },
        _count: { select: { personalQuests: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    const formatted = quests.map(formatPublicQuest);

    switch (sort) {
      case 'newest':
        return formatted.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );
      case 'difficulty': {
        const order = { easy: 1, medium: 2, hard: 3 };
        return formatted.sort(
          (a, b) =>
            (order[a.difficulty as keyof typeof order] ?? 2) -
            (order[b.difficulty as keyof typeof order] ?? 2),
        );
      }
      default:
        return formatted.sort((a, b) => b.participants - a.participants);
    }
  }

  async createPublicQuest(creatorId: string, dto: CreatePublicQuestDto) {
    await this.assertPublicQuestCreationLimit(creatorId);

    const quest = await this.database.quest.create({
      data: {
        creatorId,
        type: $Enums.QuestType.PUBLIC,
        title: dto.title,
        description: dto.description,
        icon: dto.icon ?? '⚔️',
        category: dto.category,
        difficulty: dto.difficulty ?? $Enums.QuestDifficulty.MEDIUM,
        trackingType: dto.trackingType,
        unit: dto.unit,
        targetValue: dto.targetValue,
      },
      include: {
        creator: { select: { username: true, avatar: true } },
        _count: { select: { personalQuests: true } },
      },
    });

    return formatPublicQuest(quest);
  }

  async joinPublicQuest(userId: string, questId: string) {
    const quest = await this.database.quest.findFirst({
      where: { id: questId, type: $Enums.QuestType.PUBLIC },
    });
    if (!quest) {
      throw new NotFoundException('Public quest not found');
    }
    if (quest.creatorId === userId) {
      throw new BadRequestException(
        'You cannot join or complete a public quest you created',
      );
    }

    const enrollment = await this.database.personalQuest.upsert({
      where: { userId_questId: { userId, questId } },
      create: { userId, questId },
      update: {},
    });

    return { joined: true, enrollment };
  }

  async updatePublicQuestProgress(
    userId: string,
    questId: string,
    dto: UpdateQuestProgressDto,
  ) {
    const quest = await this.database.quest.findFirst({
      where: { id: questId, type: $Enums.QuestType.PUBLIC },
    });
    if (!quest) {
      throw new NotFoundException('Public quest not found');
    }
    if (quest.creatorId === userId) {
      throw new ForbiddenException(
        'You cannot complete a public quest you created',
      );
    }

    const enrollment = await this.database.personalQuest.findUnique({
      where: { userId_questId: { userId, questId } },
    });
    if (!enrollment) {
      throw new BadRequestException('Join this quest before logging progress');
    }

    const wasComplete =
      enrollment.status === $Enums.PersonalQuestStatus.COMPLETED ||
      enrollment.currentValue >= quest.targetValue;

    const currentValue = Math.min(dto.currentValue, quest.targetValue);
    const isComplete = currentValue >= quest.targetValue;

    const updated = await this.database.personalQuest.update({
      where: { id: enrollment.id },
      data: {
        currentValue,
        status: isComplete
          ? $Enums.PersonalQuestStatus.COMPLETED
          : $Enums.PersonalQuestStatus.ACTIVE,
      },
    });

    if (isComplete && !wasComplete) {
      await this.userProgress.rewardPublicQuestCompletion(userId);
    }

    return {
      enrollment: updated,
      isComplete,
      quest: formatPublicQuest({
        ...quest,
        creator: await this.database.user.findUniqueOrThrow({
          where: { id: quest.creatorId },
          select: { username: true, avatar: true },
        }),
        _count: {
          personalQuests: await this.database.personalQuest.count({
            where: { questId },
          }),
        },
      }),
    };
  }

  private async assertPublicQuestCreationLimit(creatorId: string) {
    const dayStart = this.dates.toUtcDay();
    const dayEnd = this.dates.addDays(dayStart, 1);

    const createdToday = await this.database.quest.count({
      where: {
        creatorId,
        type: $Enums.QuestType.PUBLIC,
        createdAt: { gte: dayStart, lt: dayEnd },
      },
    });

    if (createdToday >= MAX_PUBLIC_QUESTS_PER_DAY) {
      throw new BadRequestException(
        `You can only create ${MAX_PUBLIC_QUESTS_PER_DAY} public quests per day`,
      );
    }
  }

  private async getOwnedQuestById(
    creatorId: Quest['creatorId'],
    id: Quest['id'],
  ) {
    const quest = await this.database.quest.findFirst({
      where: { id, creatorId, type: $Enums.QuestType.PERSONAL },
    });

    if (!quest) {
      throw new NotFoundException('Quest not found');
    }

    return quest;
  }
}
