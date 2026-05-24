import { Injectable } from '@nestjs/common';
import type { Prisma, Quest } from '@prisma/client';
import { DatabaseService } from '../database/database.service';
import { UpdateQuestProgressDto } from './dto/update-quest-progress.dto';
import { QuestDateService } from './quest-date.service';

@Injectable()
export class QuestProgressService {
  constructor(
    private readonly database: DatabaseService,
    private readonly dates: QuestDateService,
  ) {}

  async updateProgress(
    quest: Pick<Quest, 'id' | 'targetValue'>,
    dto: UpdateQuestProgressDto,
  ) {
    const logDate = this.dates.toUtcDay(dto.date);
    const currentValue = dto.currentValue;

    const create: Prisma.QuestLogUncheckedCreateInput = {
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

    return {
      ...log,
      isComplete: log.currentValue >= quest.targetValue,
    };
  }

  async resetToday(quest: Pick<Quest, 'id' | 'targetValue'>) {
    const logDate = this.dates.toUtcDay();
    const log = await this.database.questLog.upsert({
      where: { questId_logDate: { questId: quest.id, logDate } },
      create: {
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

    return {
      ...log,
      isComplete: false,
    };
  }
}
