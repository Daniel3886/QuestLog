import { Injectable } from '@nestjs/common';
import type { Quest } from '@prisma/client';
import { DatabaseService } from '../database/database.service';
import { QuestDateService } from '../common/quest-date.service';
import { formatQuestForLobby } from './quest-format.util';

@Injectable()
export class QuestStatsService {
  constructor(
    private readonly database: DatabaseService,
    private readonly dates: QuestDateService,
  ) {}

  async withStats(quest: Quest) {
    const today = this.dates.toUtcDay();
    const todayLog = await this.database.prisma.questLog.findUnique({
      where: { questId_logDate: { questId: quest.id, logDate: today } },
    });
    const todayProgress = todayLog?.currentValue ?? 0;
    const todayComplete = todayProgress >= quest.targetValue;
    const currentStreak = await this.calculateCurrentStreak(
      quest.id,
      quest.targetValue,
      today,
    );

    const recentNotes = await this.database.prisma.questLog.findMany({
      where: {
        questId: quest.id,
        note: { not: null },
      },
      orderBy: { logDate: 'desc' },
      take: 3,
      select: { note: true },
    });

    const notes = recentNotes
      .map((log) => log.note)
      .filter((note): note is string => !!note);

    const stats = { todayProgress, todayComplete, currentStreak, notes };

    return {
      ...quest,
      todayProgress,
      todayTarget: quest.targetValue,
      todayComplete,
      currentStreak,
      lobby: formatQuestForLobby(quest, stats),
    };
  }

  private async calculateCurrentStreak(
    questId: Quest['id'],
    targetValue: Quest['targetValue'],
    fromDate: Date,
  ) {
    const logs = await this.database.prisma.questLog.findMany({
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
