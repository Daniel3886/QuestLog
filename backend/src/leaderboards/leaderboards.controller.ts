import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { User } from 'src/auth/decorators/user.decorator';
import type { AuthUser } from 'src/auth/types/auth-user.type';
import { LeaderboardsService } from './leaderboards.service';

@Controller('leaderboards')
export class LeaderboardsController {
  constructor(private readonly leaderboardsService: LeaderboardsService) {}

  @Get('users')
  getUserLeaderboard(@Query('metric') metric?: 'streak' | 'level' | 'coins' | 'quests') {
    return this.leaderboardsService.getUserLeaderboard(metric ?? 'streak');
  }

  @Get('guilds')
  getGuildLeaderboard(@Query('metric') metric?: 'level' | 'gems' | 'quests') {
    return this.leaderboardsService.getGuildLeaderboard(metric ?? 'level');
  }

  @UseGuards(JwtAuthGuard)
  @Get('users/me')
  getMyRank(
    @User() user: AuthUser,
    @Query('metric') metric?: 'streak' | 'level' | 'coins' | 'quests',
  ) {
    return this.leaderboardsService.getUserRank(user.id, metric ?? 'streak');
  }
}
