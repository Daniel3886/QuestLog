import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/database/database.module';
import { QuestDateService } from './quest-date.service';
import { QuestProgressService } from './quest-progress.service';
import { QuestStatsService } from './quest-stats.service';
import { QuestsController } from './quests.controller';
import { QuestsService } from './quests.service';

@Module({
  imports: [DatabaseModule],
  controllers: [QuestsController],
  providers: [
    QuestsService,
    QuestDateService,
    QuestProgressService,
    QuestStatsService,
  ],
})
export class QuestsModule {}
