import { Module } from '@nestjs/common';
import { QuestDateService } from './quest-date.service';

@Module({
  providers: [QuestDateService],
  exports: [QuestDateService],
})
export class CommonModule {}
