import { IsEnum, IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { $Enums } from '@prisma/client';

export class CreateCommentDto {
  @IsEnum($Enums.CommentTargetType)
  targetType!: $Enums.CommentTargetType;

  @IsString()
  @IsNotEmpty()
  @MaxLength(64)
  targetId!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  content!: string;
}
