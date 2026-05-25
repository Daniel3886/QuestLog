import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { $Enums, User } from '@prisma/client';
import { DatabaseService } from 'src/database/database.service';
import { CreateUserInput } from 'src/auth/types/create-user-input.type';
import { deriveUserLevel } from '../common/progression';
import { QuestDateService } from '../common/quest-date.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class UserService {
  constructor(
    private readonly database: DatabaseService,
    private readonly dates: QuestDateService,
  ) {}

  async createUser({ email, password, username }: CreateUserInput) {
    const hashed = await bcrypt.hash(password, 10);
    const resolvedUsername =
      username?.trim() || (await this.generateUsername(email));

    return this.database.user.create({
      data: { email, password: hashed, username: resolvedUsername },
    });
  }

  findByEmail(email: User['email']) {
    return this.database.user.findUnique({ where: { email } });
  }

  findById(id: User['id']) {
    return this.database.user.findUnique({ where: { id } });
  }

  async getProfile(userId: string) {
    const user = await this.database.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const today = this.dates.toUtcDay();
    const personalQuests = await this.database.quest.count({
      where: { creatorId: userId, type: $Enums.QuestType.PERSONAL },
    });

    const todayLogs = await this.database.questLog.findMany({
      where: {
        userId,
        logDate: today,
        quest: { type: $Enums.QuestType.PERSONAL, frequency: $Enums.QuestFrequency.DAILY },
      },
      include: { quest: true },
    });

    const completedToday = todayLogs.filter(
      (log) => log.currentValue >= log.quest.targetValue,
    ).length;

    const dailyQuestCount = await this.database.quest.count({
      where: {
        creatorId: userId,
        type: $Enums.QuestType.PERSONAL,
        frequency: $Enums.QuestFrequency.DAILY,
      },
    });

    const progression = deriveUserLevel(user.xp);

    return {
      id: user.id,
      email: user.email,
      username: user.username,
      bio: user.bio,
      avatar: user.avatar,
      level: progression.level,
      xp: progression.xp,
      xpNext: progression.xpToNext,
      totalXp: progression.totalXp,
      coins: user.coins,
      streak: user.streak,
      weekStreak: user.weekStreak,
      totalQuests: personalQuests,
      questsCompleted: user.questsCompleted,
      completedToday,
      dailyQuestCount,
    };
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    if (dto.username) {
      const taken = await this.database.user.findFirst({
        where: { username: dto.username, id: { not: userId } },
      });
      if (taken) {
        throw new ConflictException('Username already taken');
      }
    }

    const user = await this.database.user.update({
      where: { id: userId },
      data: {
        username: dto.username,
        bio: dto.bio,
        avatar: dto.avatar,
      },
    });

    return this.getProfile(user.id);
  }

  async comparePassword(
    inputPassword: string,
    hashedPassword: User['password'],
  ): Promise<boolean> {
    return bcrypt.compare(inputPassword, hashedPassword);
  }

  private async generateUsername(email: string) {
    const base = email
      .split('@')[0]
      .replace(/[^a-zA-Z0-9_]/g, '')
      .slice(0, 20) || 'adventurer';
    let username = base;
    let suffix = 0;

    while (await this.database.user.findUnique({ where: { username } })) {
      suffix += 1;
      username = `${base}${suffix}`.slice(0, 30);
    }

    return username;
  }
}
