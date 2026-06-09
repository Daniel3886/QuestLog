import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { AdminGuard } from '../auth/guards/admin.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { User } from '../auth/decorators/user.decorator';
import type { AuthUser } from '../auth/types/auth-user.type';
import { AdminService } from './admin.service';
import { BanUserDto } from './dto/ban-user.dto';
import { UpdateBugReportDto } from './dto/update-bug-report.dto';
import { CreateEventDto } from '../events/dto/create-event.dto';
import { UpdateEventDto } from '../events/dto/update-event.dto';

@Controller('admin')
@UseGuards(JwtAuthGuard, AdminGuard) // both guards – must be authenticated and admin
export class AdminController {
  constructor(private adminService: AdminService) {}

  // Reports
  @Get('reports')
  getReports() {
    return this.adminService.getReports();
  }

  // User Ban
  @Post('users/:userId/ban')
  banUser(@User() admin: AuthUser, @Param('userId') userId: string, @Body() dto: BanUserDto) {
    return this.adminService.banUser(admin.id, userId, dto);
  }

  @Post('users/:userId/unban')
  unbanUser(@User() admin: AuthUser, @Param('userId') userId: string) {
    return this.adminService.unbanUser(admin.id, userId);
  }

  @Get('banned-users')
  getBannedUsers() {
    return this.adminService.getBannedUsers();
  }

  // Events (admin only)
  @Get('events')
  getAllEvents() {
    return this.adminService.getAllEvents();
  }

  @Post('events')
  createEvent(@User() admin: AuthUser, @Body() dto: CreateEventDto) {
    return this.adminService.createEvent(admin.id, dto);
  }

  @Patch('events/:id')
  updateEvent(@User() admin: AuthUser, @Param('id') id: string, @Body() dto: UpdateEventDto) {
    return this.adminService.updateEvent(admin.id, id, dto);
  }

  @Delete('events/:id')
  deleteEvent(@User() admin: AuthUser, @Param('id') id: string) {
    return this.adminService.deleteEvent(admin.id, id);
  }

  // Bug reports (admin)
  @Get('bug-reports')
  getAllBugReports() {
    return this.adminService.getAllBugReports();
  }

  @Patch('bug-reports/:id')
  updateBugReport(
    @User() admin: AuthUser,
    @Param('id') id: string,
    @Body() dto: UpdateBugReportDto,
  ) {
    return this.adminService.updateBugReport(admin.id, id, dto);
  }
}