import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { DatabaseModule } from './database/database.module';
import { QuestsModule } from './quests/quests.module';
import { GuildsModule } from './guilds/guilds.module';
import { EventsModule } from './events/events.module';
import { CommentsModule } from './comments/comments.module';
import { FriendsModule } from './friends/friends.module';
import { ShopModule } from './shop/shop.module';
import { ReportsModule } from './reports/reports.module';
import { LeaderboardsModule } from './leaderboards/leaderboards.module';
import { BugReportsModule } from './bug-reports/bug-reports.module';
import { AdminModule } from './admin/admin.module';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    DatabaseModule,
    QuestsModule,
    GuildsModule,
    EventsModule,
    CommentsModule,
    FriendsModule,
    ShopModule,
    ReportsModule,
    LeaderboardsModule,
    AdminModule,
    BugReportsModule,
  ],
})
export class AppModule {}
