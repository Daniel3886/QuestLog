import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { User } from 'src/auth/decorators/user.decorator';
import type { AuthUser } from 'src/auth/types/auth-user.type';
import { ContributeEventDto } from './dto/contribute-event.dto';
import { EventsService } from './events.service';
import { mockEvents } from '../mock-data';

@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  // @Get()
  // listEvents() {
  //   return this.eventsService.listEvents();
  // }
  @Get()
  async listEvents() {
    return mockEvents;
  }

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
}
