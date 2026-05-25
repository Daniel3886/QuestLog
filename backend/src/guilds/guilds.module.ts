import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/database/database.module';
import { GuildsController } from './guilds.controller';
import { GuildsService } from './guilds.service';

@Module({
  imports: [DatabaseModule],
  controllers: [GuildsController],
  providers: [GuildsService],
  exports: [GuildsService],
})
export class GuildsModule {}
