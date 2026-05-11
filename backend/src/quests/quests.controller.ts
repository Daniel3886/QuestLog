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
  create(@User() user: AuthUser, @Body() dto: CreateQuestDto) {
    return this.questsService.create(user.id, dto);
  }

  @Get()
  findAll(@User() user: AuthUser) {
    return this.questsService.findAll(user.id);
  }

  @Get(':id')
  findOne(@User() user: AuthUser, @Param('id') id: string) {
    return this.questsService.findOne(user.id, id);
  }

  @Patch(':id')
  update(
    @User() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: UpdateQuestDto,
  ) {
    return this.questsService.update(user.id, id, dto);
  }

  @Patch(':id/progress')
  updateProgress(
    @User() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: UpdateQuestProgressDto,
  ) {
    return this.questsService.updateProgress(user.id, id, dto);
  }

  @Post(':id/reset-today')
  resetToday(@User() user: AuthUser, @Param('id') id: string) {
    return this.questsService.resetToday(user.id, id);
  }

  @Delete(':id')
  remove(@User() user: AuthUser, @Param('id') id: string) {
    return this.questsService.remove(user.id, id);
  }
}
