import { Body, Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { AdminGuard } from 'src/auth/guards/admin.guard';
import { User } from 'src/auth/decorators/user.decorator';
import type { AuthUser } from 'src/auth/types/auth-user.type';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UserService } from './users.service';

@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly userService: UserService) {}

  @Get('me')
  getProfile(@User() user: AuthUser) {
    return this.userService.getProfile(user.id);
  }

  @Patch('me')
  updateProfile(@User() user: AuthUser, @Body() dto: UpdateProfileDto) {
    return this.userService.updateProfile(user.id, dto);
  }

  @Get('me/badges')
  @UseGuards(JwtAuthGuard)
  async getActiveBadges(@User() user: AuthUser) {
    return this.userService.getActiveBadges(user.id);
  }

  @UseGuards(AdminGuard)
  @Patch(':id/ban')
  banUser(@Param('id') id: string) {
    return this.userService.setUserBan(id, true);
  }

  @UseGuards(AdminGuard)
  @Patch(':id/unban')
  unbanUser(@Param('id') id: string) {
    return this.userService.setUserBan(id, false);
  }
}
