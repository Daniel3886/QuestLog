import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/database/database.module';
import { FriendsController } from './friends.controller';
import { FriendsService } from './friends.service';

@Module({
  imports: [DatabaseModule],
  controllers: [FriendsController],
  providers: [FriendsService],
})
export class FriendsModule {}
