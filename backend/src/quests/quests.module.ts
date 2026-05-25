import { Module } from '@nestjs/common';
import { CommonModule } from 'src/common/common.module';
import { DatabaseModule } from 'src/database/database.module';
import { UsersModule } from 'src/users/users.module';
import { QuestProgressService } from './quest-progress.service';
import { QuestStatsService } from './quest-stats.service';
import { QuestsController } from './quests.controller';
import { QuestsService } from './quests.service';

@Module({
  imports: [DatabaseModule, CommonModule, UsersModule],
  controllers: [QuestsController],
  providers: [QuestsService, QuestProgressService, QuestStatsService],
})
export class QuestsModule {}
