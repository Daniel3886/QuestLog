import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { UserProgressService } from '../users/user-progress.service';
import { ContributeEventDto } from './dto/contribute-event.dto';

@Injectable()
export class EventsService {
  constructor(
    private readonly database: DatabaseService,
    private readonly userProgress: UserProgressService,
  ) {}

  async listEvents() {
    const now = new Date();
    const events = await this.database.event.findMany({
      where: { endDate: { gte: now } },
      include: {
        rewardItem: true,
        _count: { select: { participations: true } },
      },
      orderBy: { endDate: 'asc' },
    });

    return events.map((event) => this.formatEvent(event, now));
  }

  async getEvent(id: string) {
    const event = await this.database.event.findUnique({
      where: { id },
      include: {
        rewardItem: true,
        _count: { select: { participations: true } },
      },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    return this.formatEvent(event, new Date());
  }

  async joinEvent(userId: string, eventId: string) {
    const event = await this.database.event.findUnique({
      where: { id: eventId },
    });
    if (!event) {
      throw new NotFoundException('Event not found');
    }
    if (event.endDate < new Date()) {
      throw new BadRequestException('Event has ended');
    }

    await this.database.participation.upsert({
      where: { userId_eventId: { userId, eventId } },
      create: { userId, eventId },
      update: {},
    });

    const rewardsGranted = await this.tryGrantEventRewards(userId, event);

    return { joined: true, rewardsGranted };
  }

  async contribute(userId: string, eventId: string, dto: ContributeEventDto) {
    const event = await this.database.event.findUnique({
      where: { id: eventId },
    });
    if (!event) {
      throw new NotFoundException('Event not found');
    }
    if (event.endDate < new Date()) {
      throw new BadRequestException('Event has ended');
    }

    const participation = await this.database.participation.upsert({
      where: { userId_eventId: { userId, eventId } },
      create: {
        userId,
        eventId,
        contribution: dto.amount,
      },
      update: {
        contribution: { increment: dto.amount },
      },
    });

    const updated = await this.database.event.update({
      where: { id: eventId },
      data: {
        currentValue: { increment: dto.amount },
      },
      include: {
        rewardItem: true,
        _count: { select: { participations: true } },
      },
    });

    const rewardsGranted = await this.tryGrantEventRewards(userId, updated);

    return {
      ...this.formatEvent(updated, new Date()),
      rewardsGranted,
      rewardXp: updated.rewardXp,
      rewardCoins: updated.rewardCoins,
    };
  }

  private async tryGrantEventRewards(
    userId: string,
    event: { id: string; targetValue: number; currentValue: number; rewardXp: number; rewardCoins: number },
  ) {
    if (event.currentValue < event.targetValue) {
      return false;
    }

    const participation = await this.database.participation.findUnique({
      where: { userId_eventId: { userId, eventId: event.id } },
    });
    if (!participation || participation.rewardsClaimed) {
      return false;
    }

    await this.userProgress.rewardEventCompletion(
      userId,
      event.rewardXp,
      event.rewardCoins,
    );
    await this.database.participation.update({
      where: { userId_eventId: { userId, eventId: event.id } },
      data: { rewardsClaimed: true },
    });

    return true;
  }

  private formatEvent(
    event: {
      id: string;
      title: string;
      description: string | null;
      icon: string;
      targetValue: number;
      currentValue: number;
      unit: string | null;
      startDate: Date;
      endDate: Date;
      rewardCoins: number;
      rewardXp: number;
      rewardItem: { name: string } | null;
      _count: { participations: number };
    },
    now: Date,
  ) {
    const progress = event.targetValue
      ? (event.currentValue / event.targetValue) * 100
      : 0;
    const daysLeft = Math.ceil(
      (event.endDate.getTime() - now.getTime()) / (1000 * 3600 * 24),
    );

    let status: 'active' | 'ending-soon' | 'completed' = 'active';
    if (event.currentValue >= event.targetValue) {
      status = 'completed';
    } else if (daysLeft <= 3) {
      status = 'ending-soon';
    }

    return {
      id: event.id,
      title: event.title,
      description: event.description,
      icon: event.icon,
      currentValue: event.currentValue,
      targetValue: event.targetValue,
      unit: event.unit ?? '',
      startDate: event.startDate,
      endDate: event.endDate,
      participants: event._count.participations,
      rewardCoins: event.rewardCoins,
      rewardXp: event.rewardXp,
      rewardItemName: event.rewardItem?.name ?? null,
      progressPercent: Math.round(progress),
      status,
    };
  }
}
