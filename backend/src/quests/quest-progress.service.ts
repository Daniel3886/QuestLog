import { Injectable } from '@nestjs/common';
import type { Prisma, Quest } from '@prisma/client';
import { DatabaseService } from '../database/database.service';
import { QuestDateService } from '../common/quest-date.service';
import { UserProgressService } from '../users/user-progress.service';
import { UpdateQuestProgressDto } from './dto/update-quest-progress.dto';

@Injectable()
export class QuestProgressService {
  constructor(
    private readonly database: DatabaseService,
    private readonly dates: QuestDateService,
    private readonly userProgress: UserProgressService,
  ) {}

  async updateProgress(
    userId: Quest['creatorId'],
    quest: Pick<Quest, 'id' | 'targetValue'>,
    dto: UpdateQuestProgressDto,
  ) {
    const logDate = this.dates.toUtcDay(dto.date);
    const currentValue = dto.currentValue;

    const existing = await this.database.questLog.findUnique({
      where: { questId_logDate: { questId: quest.id, logDate } },
    });
    const wasComplete =
      (existing?.currentValue ?? 0) >= quest.targetValue;

    const create: Prisma.QuestLogUncheckedCreateInput = {
      userId,
      questId: quest.id,
      logDate,
      currentValue,
      rating: dto.rating,
      note: dto.note,
      proofUrl: dto.proofUrl,
    };
    const update: Prisma.QuestLogUncheckedUpdateInput = {
      currentValue,
      rating: dto.rating,
      note: dto.note,
      proofUrl: dto.proofUrl,
    };
    const log = await this.database.questLog.upsert({
      where: { questId_logDate: { questId: quest.id, logDate } },
      create,
      update,
    });

    const isComplete = log.currentValue >= quest.targetValue;
    if (isComplete && !wasComplete) {
      await this.userProgress.onPersonalQuestCompleted(userId);
    }

    return { ...log, isComplete };
  }

  async resetToday(
    userId: Quest['creatorId'],
    quest: Pick<Quest, 'id' | 'targetValue'>,
  ) {
    const logDate = this.dates.toUtcDay();
    const log = await this.database.questLog.upsert({
      where: { questId_logDate: { questId: quest.id, logDate } },
      create: {
        userId,
        questId: quest.id,
        logDate,
        currentValue: 0,
      },
      update: {
        currentValue: 0,
        rating: null,
        note: null,
        proofUrl: null,
      },
    });

    return { ...log, isComplete: false };
  }
}
