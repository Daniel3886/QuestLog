import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { $Enums } from '@prisma/client';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { User } from 'src/auth/decorators/user.decorator';
import type { AuthUser } from 'src/auth/types/auth-user.type';
import { CreatePublicQuestDto } from './dto/create-public-quest.dto';
import { CreateQuestDto } from './dto/create-quest.dto';
import { UpdateQuestDto } from './dto/update-quest.dto';
import { UpdateQuestProgressDto } from './dto/update-quest-progress.dto';
import { QuestsService } from './quests.service';
//import { mockPublicQuests } from '../mock-data';


@Controller('quests')
export class QuestsController {
  constructor(private readonly questsService: QuestsService) {}

  @Get('public')
  listPublicQuests(
    @Query('category') category?: $Enums.QuestCategory,
    @Query('sort') sort?: 'popular' | 'newest' | 'difficulty',
  ) {
    return this.questsService.listPublicQuests(category, sort);
  }

//   @Get('public')
// async listPublicQuests(@Query('sort') sort?: string) {
//   let result = [...mockPublicQuests];
  
//   if (sort === 'popular') {
//     result.sort((a, b) => b.participants - a.participants);
//   } else if (sort === 'newest') {
//     result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
//   } else if (sort === 'difficulty') {
//     const difficultyOrder: Record<string, number> = { easy: 1, medium: 2, hard: 3 };
//     result.sort((a, b) => {
//       const aOrder = difficultyOrder[a.difficulty] ?? 999;
//       const bOrder = difficultyOrder[b.difficulty] ?? 999;
//       return aOrder - bOrder;
//     });
//   }
  
//   return result;
// }

  @UseGuards(JwtAuthGuard)
  @Post('public')
  createPublicQuest(
    @User() user: AuthUser,
    @Body() dto: CreatePublicQuestDto,
  ) {
    return this.questsService.createPublicQuest(user.id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('public/:id/join')
  joinPublicQuest(@User() user: AuthUser, @Param('id') id: string) {
    return this.questsService.joinPublicQuest(user.id, id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('public/:id/progress')
  updatePublicQuestProgress(
    @User() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: UpdateQuestProgressDto,
  ) {
    return this.questsService.updatePublicQuestProgress(user.id, id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  createQuest(@User() user: AuthUser, @Body() dto: CreateQuestDto) {
    return this.questsService.createQuest(user.id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  listQuests(@User() user: AuthUser) {
    return this.questsService.listQuests(user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  getQuest(@User() user: AuthUser, @Param('id') id: string) {
    return this.questsService.getQuest(user.id, id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  updateQuest(
    @User() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: UpdateQuestDto,
  ) {
    return this.questsService.updateQuest(user.id, id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/progress')
  updateQuestProgress(
    @User() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: UpdateQuestProgressDto,
  ) {
    return this.questsService.updateQuestProgress(user.id, id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/reset-today')
  resetQuestToday(@User() user: AuthUser, @Param('id') id: string) {
    return this.questsService.resetQuestToday(user.id, id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  deleteQuest(@User() user: AuthUser, @Param('id') id: string) {
    return this.questsService.deleteQuest(user.id, id);
  }
}
