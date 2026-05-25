import { Injectable } from '@nestjs/common';
import { $Enums } from '@prisma/client';
import { deriveUserLevel } from '../common/progression';
import { DatabaseService } from '../database/database.service';

type UserMetric = 'streak' | 'level' | 'coins' | 'quests';
type GuildMetric = 'level' | 'gems' | 'quests';

@Injectable()
export class LeaderboardsService {
  constructor(private readonly database: DatabaseService) {}

  async getUserLeaderboard(metric: UserMetric = 'streak', limit = 50) {
    const users = await this.database.user.findMany({
      select: {
        id: true,
        username: true,
        avatar: true,
        coins: true,
        streak: true,
        xp: true,
        questsCompleted: true,
      },
      take: 200,
    });

    const ranked = users
      .map((user) => {
        const { level } = deriveUserLevel(user.xp);
        return {
          id: user.id,
          username: user.username,
          avatar: user.avatar,
          level,
          streak: user.streak,
          coins: user.coins,
          totalQuests: user.questsCompleted,
          totalXp: user.xp,
        };
      })
      .sort((a, b) => this.compareUserMetric(a, b, metric))
      .slice(0, limit)
      .map((user, index) => ({ ...user, rank: index + 1 }));

    return ranked;
  }

  async getGuildLeaderboard(metric: GuildMetric = 'level', limit = 50) {
    const guilds = await this.database.guild.findMany({
      include: {
        _count: {
          select: {
            members: true,
            guildQuests: {
              where: { status: $Enums.GuildQuestStatus.COMPLETED },
            },
          },
        },
      },
      take: 200,
    });

    const ranked = guilds
      .map((guild) => ({
        id: guild.id,
        name: guild.name,
        avatar: guild.avatar,
        level: guild.level,
        gems: guild.gems,
        members: guild._count.members,
        totalQuests: guild._count.guildQuests,
        totalXp: guild.xp,
      }))
      .sort((a, b) => this.compareGuildMetric(a, b, metric))
      .slice(0, limit)
      .map((guild, index) => ({ ...guild, rank: index + 1 }));

    return ranked;
  }

  async getUserRank(userId: string, metric: UserMetric = 'streak') {
    const board = await this.getUserLeaderboard(metric, 500);
    const entry = board.find((u) => u.id === userId);
    if (entry) {
      return entry;
    }

    const user = await this.database.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        avatar: true,
        coins: true,
        streak: true,
        xp: true,
        questsCompleted: true,
      },
    });

    if (!user) {
      return null;
    }

    const { level } = deriveUserLevel(user.xp);

    return {
      id: user.id,
      username: user.username,
      avatar: user.avatar,
      level,
      streak: user.streak,
      coins: user.coins,
      totalQuests: user.questsCompleted,
      totalXp: user.xp,
      rank: board.length + 1,
    };
  }

  private compareUserMetric(
    a: { streak: number; level: number; coins: number; totalQuests: number },
    b: { streak: number; level: number; coins: number; totalQuests: number },
    metric: UserMetric,
  ) {
    switch (metric) {
      case 'level':
        return b.level - a.level;
      case 'coins':
        return b.coins - a.coins;
      case 'quests':
        return b.totalQuests - a.totalQuests;
      default:
        return b.streak - a.streak;
    }
  }

  private compareGuildMetric(
    a: { level: number; gems: number; totalQuests: number },
    b: { level: number; gems: number; totalQuests: number },
    metric: GuildMetric,
  ) {
    switch (metric) {
      case 'gems':
        return b.gems - a.gems;
      case 'quests':
        return b.totalQuests - a.totalQuests;
      default:
        return b.level - a.level;
    }
  }
}
