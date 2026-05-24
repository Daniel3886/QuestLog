import { BadRequestException, Injectable } from '@nestjs/common';

@Injectable()
export class QuestDateService {
  toUtcDay(value?: string | Date) {
    const date = value ? new Date(value) : new Date();
    if (Number.isNaN(date.getTime())) {
      throw new BadRequestException('Invalid date');
    }

    return new Date(
      Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
    );
  }

  toDateKey(date: Date) {
    return date.toISOString().slice(0, 10);
  }

  addDays(date: Date, days: number) {
    const next = new Date(date);
    next.setUTCDate(next.getUTCDate() + days);
    return next;
  }
}
