import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { User } from 'src/auth/decorators/user.decorator';
import type { AuthUser } from 'src/auth/types/auth-user.type';
import { CreateGuildDto } from './dto/create-guild.dto';
import { CreateGuildQuestDto } from './dto/create-guild-quest.dto';
import { LogGuildProgressDto } from './dto/log-guild-progress.dto';
import { UpdateGuildDto } from './dto/update-guild.dto';
import { GuildsService } from './guilds.service';

@UseGuards(JwtAuthGuard)
@Controller('guilds')
export class GuildsController {
  constructor(private readonly guildsService: GuildsService) {}

  @Post()
  createGuild(@User() user: AuthUser, @Body() dto: CreateGuildDto) {
    return this.guildsService.createGuild(user.id, dto);
  }

  @Get('me')
  getMyGuild(@User() user: AuthUser) {
    return this.guildsService.getMyGuild(user.id);
  }

  @Get(':id')
  getGuild(@User() user: AuthUser, @Param('id') id: string) {
    return this.guildsService.getGuild(user.id, id);
  }

  @Patch(':id')
  updateGuild(
    @User() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: UpdateGuildDto,
  ) {
    return this.guildsService.updateGuild(user.id, id, dto);
  }

  @Post(':id/join')
  joinGuild(@User() user: AuthUser, @Param('id') id: string) {
    return this.guildsService.joinGuild(user.id, id);
  }

  @Post(':id/leave')
  leaveGuild(@User() user: AuthUser, @Param('id') id: string) {
    return this.guildsService.leaveGuild(user.id, id);
  }

  @Get(':id/quests')
  listGuildQuests(@User() user: AuthUser, @Param('id') id: string) {
    return this.guildsService.listGuildQuests(user.id, id);
  }

  @Post(':id/quests')
  createGuildQuest(
    @User() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: CreateGuildQuestDto,
  ) {
    return this.guildsService.createGuildQuest(user.id, id, dto);
  }

  @Post(':id/quests/:questId/vote')
  voteGuildQuest(
    @User() user: AuthUser,
    @Param('id') id: string,
    @Param('questId') questId: string,
  ) {
    return this.guildsService.voteGuildQuest(user.id, id, questId);
  }

  @Post(':id/quests/:questId/progress')
  logGuildProgress(
    @User() user: AuthUser,
    @Param('id') id: string,
    @Param('questId') questId: string,
    @Body() dto: LogGuildProgressDto,
  ) {
    return this.guildsService.logGuildProgress(user.id, id, questId, dto);
  }
}
