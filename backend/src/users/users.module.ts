import { Module } from '@nestjs/common';
import { CommonModule } from 'src/common/common.module';
import { DatabaseModule } from 'src/database/database.module';
import { UserProgressService } from './user-progress.service';
import { UsersController } from './users.controller';
import { UserService } from './users.service';

@Module({
  imports: [DatabaseModule, CommonModule],
  controllers: [UsersController],
  providers: [UserService, UserProgressService],
  exports: [UserService, UserProgressService],
})
export class UsersModule {}
