import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { User } from 'src/auth/decorators/user.decorator';
import type { AuthUser } from 'src/auth/types/auth-user.type';
import { CreateQuestDto } from './dto/create-quest.dto';
import { UpdateQuestDto } from './dto/update-quest.dto';
import { UpdateQuestProgressDto } from './dto/update-quest-progress.dto';
import { QuestsService } from './quests.service';

@UseGuards(JwtAuthGuard)
@Controller('quests')
export class QuestsController {
  constructor(private readonly questsService: QuestsService) {}

  @Post()
  createQuest(@User() user: AuthUser, @Body() dto: CreateQuestDto) {
    return this.questsService.createQuest({ creatorId: user.id, dto });
  }

  @Get()
  listQuests(@User() user: AuthUser) {
    return this.questsService.listQuests(user.id);
  }

  @Get(':id')
  getQuest(@User() user: AuthUser, @Param('id') id: string) {
    return this.questsService.getQuest(user.id, id);
  }

  @Patch(':id')
  updateQuest(
    @User() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: UpdateQuestDto,
  ) {
    return this.questsService.updateQuest(user.id, id, dto);
  }

  @Patch(':id/progress')
  updateQuestProgress(
    @User() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: UpdateQuestProgressDto,
  ) {
    return this.questsService.updateQuestProgress(user.id, id, dto);
  }

  @Post(':id/reset-today')
  resetQuestToday(@User() user: AuthUser, @Param('id') id: string) {
    return this.questsService.resetQuestToday(user.id, id);
  }

  @Delete(':id')
  deleteQuest(@User() user: AuthUser, @Param('id') id: string) {
    return this.questsService.deleteQuest(user.id, id);
  }
}
