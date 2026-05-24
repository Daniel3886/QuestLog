import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
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
}
