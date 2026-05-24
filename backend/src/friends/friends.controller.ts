import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { User } from 'src/auth/decorators/user.decorator';
import type { AuthUser } from 'src/auth/types/auth-user.type';
import { SendFriendRequestDto } from './dto/send-friend-request.dto';
import { FriendsService } from './friends.service';

@UseGuards(JwtAuthGuard)
@Controller('friends')
export class FriendsController {
  constructor(private readonly friendsService: FriendsService) {}

  @Get()
  listFriends(@User() user: AuthUser) {
    return this.friendsService.listFriends(user.id);
  }

  @Get('pending')
  listPending(@User() user: AuthUser) {
    return this.friendsService.listPending(user.id);
  }

  @Post('request')
  sendRequest(@User() user: AuthUser, @Body() dto: SendFriendRequestDto) {
    return this.friendsService.sendRequest(user.id, dto.friendId);
  }

  @Patch(':id/accept')
  acceptRequest(@User() user: AuthUser, @Param('id') id: string) {
    return this.friendsService.acceptRequest(user.id, id);
  }

  @Delete(':id')
  removeFriend(@User() user: AuthUser, @Param('id') id: string) {
    return this.friendsService.removeFriend(user.id, id);
  }
}
