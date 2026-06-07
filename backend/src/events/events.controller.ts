import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { AdminGuard } from 'src/auth/guards/admin.guard';
import { User } from 'src/auth/decorators/user.decorator';
import type { AuthUser } from 'src/auth/types/auth-user.type';
import { ContributeEventDto } from './dto/contribute-event.dto';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { EventsService } from './events.service';

@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Get()
  listEvents() {
    return this.eventsService.listEvents();
  }
  // @Get()
  // async listEvents() {
  //   return mockEvents;
  // }

  @Get(':id')
  getEvent(@Param('id') id: string) {
    return this.eventsService.getEvent(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/join')
  joinEvent(@User() user: AuthUser, @Param('id') id: string) {
    return this.eventsService.joinEvent(user.id, id);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/contribute')
  contribute(
    @User() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: ContributeEventDto,
  ) {
    return this.eventsService.contribute(user.id, id, dto);
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Post()
  createEvent(@Body() dto: CreateEventDto) {
    return this.eventsService.createEvent(dto);
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Put(':id')
  updateEvent(@Param('id') id: string, @Body() dto: UpdateEventDto) {
    return this.eventsService.updateEvent(id, dto);
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Delete(':id')
  deleteEvent(@Param('id') id: string) {
    return this.eventsService.deleteEvent(id);
  }
}
