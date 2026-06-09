import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { $Enums } from '@prisma/client';
import { DatabaseService } from '../database/database.service';
import { CreateCommentDto } from './dto/create-comment.dto';

@Injectable()
export class CommentsService {
  constructor(private readonly database: DatabaseService) {}

  async listComments(targetType: $Enums.CommentTargetType, targetId: string) {
    const comments = await this.database.prisma.comment.findMany({
      where: { targetType, targetId, reported: false },
      include: {
        user: { select: { id: true, username: true, avatar: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    return comments.map((c) => ({
      id: c.id,
      userId: c.userId,
      userName: c.user.username,
      userAvatar: c.user.avatar,
      content: c.content,
      createdAt: c.createdAt,
      reported: c.reported,
    }));
  }

  async createComment(userId: string, dto: CreateCommentDto) {
    const comment = await this.database.prisma.comment.create({
      data: {
        userId,
        targetType: dto.targetType,
        targetId: dto.targetId,
        content: dto.content,
      },
      include: {
        user: { select: { id: true, username: true, avatar: true } },
      },
    });

    return {
      id: comment.id,
      userId: comment.userId,
      userName: comment.user.username,
      userAvatar: comment.user.avatar,
      content: comment.content,
      createdAt: comment.createdAt,
      reported: comment.reported,
    };
  }

  async deleteComment(userId: string, id: string, isAdmin = false) {
    const comment = await this.database.prisma.comment.findUnique({ where: { id } });
    if (!comment) {
      throw new NotFoundException('Comment not found');
    }
    if (!isAdmin && comment.userId !== userId) {
      throw new ForbiddenException('Cannot delete this comment');
    }

    await this.database.prisma.comment.delete({ where: { id } });
    return { deleted: true };
  }

  async flagComment(id: string) {
    const comment = await this.database.prisma.comment.findUnique({ where: { id } });
    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    await this.database.prisma.comment.update({
      where: { id },
      data: { reported: true },
    });

    return { reported: true };
  }
}
