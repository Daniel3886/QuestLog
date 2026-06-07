import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { $Enums } from '@prisma/client';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class FriendsService {
  constructor(private readonly database: DatabaseService) {}

  async listFriends(userId: string) {
    const friendships = await this.database.friend.findMany({
      where: {
        OR: [
          { userId, status: $Enums.FriendStatus.ACCEPTED },
          { friendId: userId, status: $Enums.FriendStatus.ACCEPTED },
        ],
      },
      include: {
        user: { select: { id: true, username: true, avatar: true, streak: true } },
        friend: { select: { id: true, username: true, avatar: true, streak: true } },
      },
    });

    return friendships.map((f) => {
      const other = f.userId === userId ? f.friend : f.user;
      return {
        id: f.id,
        userId: other.id,
        username: other.username,
        avatar: other.avatar,
        streak: other.streak,
        since: f.updatedAt,
      };
    });
  }

  async listPending(userId: string) {
    const incoming = await this.database.friend.findMany({
      where: { friendId: userId, status: $Enums.FriendStatus.PENDING },
      include: {
        user: { select: { id: true, username: true } },
      },
    });

    return incoming.map((f) => ({
      id: f.id,
      fromUserId: f.userId,
      fromUsername: f.user.username,
      createdAt: f.createdAt,
    }));
  }

  async sendRequest(userId: string, friendEmail: string) {
    const target = await this.database.user.findUnique({
      where: { email: friendEmail },
    });
    if (!target) {
      throw new NotFoundException('User not found');
    }
    if (userId === target.id) {
      throw new BadRequestException('Cannot add yourself');
    }

    const friendId = target.id;

    const existing = await this.database.friend.findFirst({
      where: {
        OR: [
          { userId, friendId },
          { userId: friendId, friendId: userId },
        ],
      },
    });
    if (existing) {
      throw new BadRequestException('Friend request already exists');
    }

    return this.database.friend.create({
      data: { userId, friendId },
      include: {
        friend: { select: { id: true, username: true } },
      },
    });
  }

  async acceptRequest(userId: string, requestId: string) {
    const request = await this.database.friend.findFirst({
      where: { id: requestId, friendId: userId, status: $Enums.FriendStatus.PENDING },
    });
    if (!request) {
      throw new NotFoundException('Friend request not found');
    }

    return this.database.friend.update({
      where: { id: requestId },
      data: { status: $Enums.FriendStatus.ACCEPTED },
    });
  }

  async removeFriend(userId: string, friendshipId: string) {
    const friendship = await this.database.friend.findFirst({
      where: {
        id: friendshipId,
        OR: [{ userId }, { friendId: userId }],
      },
    });
    if (!friendship) {
      throw new NotFoundException('Friendship not found');
    }

    await this.database.friend.delete({ where: { id: friendshipId } });
    return { removed: true };
  }
}
