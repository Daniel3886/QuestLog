import { Injectable } from '@nestjs/common';
import type { Quest } from '@prisma/client';
import { DatabaseService } from '../database/database.service';
import { QuestDateService } from './quest-date.service';

@Injectable()
export class QuestStatsService {
  constructor(
    private readonly database: DatabaseService,
    private readonly dates: QuestDateService,
  ) {}

  async withStats(quest: Quest) {
    const today = this.dates.toUtcDay();
    const todayLog = await this.database.questLog.findUnique({
      where: { questId_logDate: { questId: quest.id, logDate: today } },
    });
    const currentStreak = await this.calculateCurrentStreak(
      quest.id,
      quest.targetValue,
      today,
    );

    return {
      ...quest,
      todayProgress: todayLog?.currentValue ?? 0,
      todayTarget: quest.targetValue,
      todayComplete: (todayLog?.currentValue ?? 0) >= quest.targetValue,
      currentStreak,
    };
  }

  private async calculateCurrentStreak(
    questId: Quest['id'],
    targetValue: Quest['targetValue'],
    fromDate: Date,
  ) {
    const logs = await this.database.questLog.findMany({
      where: {
        questId,
        logDate: { lte: fromDate },
        currentValue: { gte: targetValue },
      },
    });

    const completedDates = new Set(
      logs.map((log) => this.dates.toDateKey(log.logDate)),
    );
    let streak = 0;
    let cursor = fromDate;

    while (completedDates.has(this.dates.toDateKey(cursor))) {
      streak += 1;
      cursor = this.dates.addDays(cursor, -1);
    }

    return streak;
  }
}
