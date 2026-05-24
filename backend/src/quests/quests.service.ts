import { Injectable, NotFoundException } from '@nestjs/common';
import type { Prisma, Quest } from '@prisma/client';
import { DatabaseService } from '../database/database.service';
import { UpdateQuestProgressDto } from './dto/update-quest-progress.dto';
import { UpdateQuestDto } from './dto/update-quest.dto';
import { QuestProgressService } from './quest-progress.service';
import { QuestStatsService } from './quest-stats.service';
import { CreateQuestDto } from './dto/create-quest.dto';

@Injectable()
export class QuestsService {
  constructor(
    private readonly database: DatabaseService,
    private readonly progress: QuestProgressService,
    private readonly stats: QuestStatsService,
  ) {}

  async createQuest(creatorId: Quest['creatorId'], dto: CreateQuestDto) {
    const data: Prisma.QuestUncheckedCreateInput = {
      creatorId,
      title: dto.title,
      description: dto.description,
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
      where: { creatorId },
      orderBy: { createdAt: 'desc' },
    });

    return Promise.all(quests.map((quest) => this.stats.withStats(quest)));
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

  private async getOwnedQuestById(
    creatorId: Quest['creatorId'],
    id: Quest['id'],
  ) {
    const quest = await this.database.quest.findFirst({
      where: { id, creatorId },
    });

    if (!quest) {
      throw new NotFoundException('Quest not found');
    }

    return quest;
  }
}
