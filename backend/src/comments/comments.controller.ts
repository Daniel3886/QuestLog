import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { $Enums } from '@prisma/client';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { User } from 'src/auth/decorators/user.decorator';
import type { AuthUser } from 'src/auth/types/auth-user.type';
import { CreateCommentDto } from './dto/create-comment.dto';
import { CommentsService } from './comments.service';
import { mockComments } from '../mock-data';

@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  // @Get()
  // listComments(
  //   @Query('targetType') targetType: $Enums.CommentTargetType,
  //   @Query('targetId') targetId: string,
  // ) {
  //   return this.commentsService.listComments(targetType, targetId);
  // }

  @Get()
  async listComments(@Query('targetType') targetType: string, @Query('targetId') targetId: string) {
    // Return mock comments for any target
    return mockComments;
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  createComment(@User() user: AuthUser, @Body() dto: CreateCommentDto) {
    return this.commentsService.createComment(user.id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  deleteComment(@User() user: AuthUser, @Param('id') id: string) {
    return this.commentsService.deleteComment(user.id, id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/report')
  flagComment(@Param('id') id: string) {
    return this.commentsService.flagComment(id);
  }
}
