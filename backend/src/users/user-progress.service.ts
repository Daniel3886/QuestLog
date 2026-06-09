import { Injectable } from '@nestjs/common';
import { $Enums } from '@prisma/client';
import { DatabaseService } from '../database/database.service';
import { addUserTotalXp, deriveUserLevel } from '../common/progression';
import { QuestDateService } from '../common/quest-date.service';

const PUBLIC_QUEST_XP = 1;
const PUBLIC_QUEST_COINS = 1;

@Injectable()
export class UserProgressService {
  constructor(
    private readonly database: DatabaseService,
    private readonly dates: QuestDateService,
  ) {}

  /** Personal lobby quests: track streaks only, no XP or coins. */
  async onPersonalQuestCompleted(userId: string) {
    await this.database.prisma.user.update({
      where: { id: userId },
      data: {
        questsCompleted: { increment: 1 },
        streak: { increment: 1 },
      },
    });
    await this.refreshWeekStreak(userId);
  }

  /** Tavern public quest completion: +1 XP and +1 coin (not for own quests). */
  async rewardPublicQuestCompletion(userId: string) {
    await this.grantXpAndCoins(userId, PUBLIC_QUEST_XP, PUBLIC_QUEST_COINS, {
      incrementQuestsCompleted: true,
    });
  }

  /** Global event reward (amounts set by admin on the event). */
  async rewardEventCompletion(
    userId: string,
    rewardXp: number,
    rewardCoins: number,
  ) {
    if (rewardXp <= 0 && rewardCoins <= 0) {
      return;
    }

    await this.grantXpAndCoins(userId, rewardXp, rewardCoins, {
      incrementQuestsCompleted: false,
    });
  }

  private async grantXpAndCoins(
    userId: string,
    xpGain: number,
    coinGain: number,
    options: { incrementQuestsCompleted: boolean },
  ) {
    const user = await this.database.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return;
    }

    const totalXp = addUserTotalXp(user.xp, xpGain);
    const { level } = deriveUserLevel(totalXp);

    await this.database.prisma.user.update({
      where: { id: userId },
      data: {
        xp: totalXp,
        level,
        coins: { increment: coinGain },
        ...(options.incrementQuestsCompleted
          ? { questsCompleted: { increment: 1 } }
          : {}),
      },
    });
  }

  private async refreshWeekStreak(userId: string) {
    const today = this.dates.toUtcDay();
    const weekStart = this.dates.addDays(today, -6);

    const logs = await this.database.prisma.questLog.findMany({
      where: {
        userId,
        logDate: { gte: weekStart, lte: today },
        quest: { type: $Enums.QuestType.PERSONAL },
      },
      include: { quest: true },
    });

    const activeDays = new Set<string>();
    for (const log of logs) {
      if (log.currentValue >= log.quest.targetValue) {
        activeDays.add(this.dates.toDateKey(log.logDate));
      }
    }

    await this.database.prisma.user.update({
      where: { id: userId },
      data: {
        weekStreak: activeDays.size,
        activeDays: activeDays.size,
      },
    });
  }
}
