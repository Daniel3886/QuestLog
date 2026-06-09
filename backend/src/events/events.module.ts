import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/database/database.module';
import { UsersModule } from 'src/users/users.module';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';

@Module({
  imports: [DatabaseModule, UsersModule],
  controllers: [EventsController],
  providers: [EventsService],
  exports: [EventsService],
})
export class EventsModule {}
