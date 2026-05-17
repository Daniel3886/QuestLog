import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { DatabaseService } from './database/database.service';
import { DatabaseModule } from './database/database.module';
import { QuestsModule } from './quests/quests.module';

@Module({
  imports: [AuthModule, UsersModule, DatabaseModule, QuestsModule],
})
export class AppModule {}
