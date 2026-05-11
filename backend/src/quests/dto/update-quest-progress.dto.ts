import { QuestRating } from '@prisma/client';
import {
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class UpdateQuestProgressDto {
  @IsDateString()
  @IsOptional()
  date?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  currentValue?: number;

  @IsNumber()
  @IsOptional()
  incrementBy?: number;

  @IsEnum(QuestRating)
  @IsOptional()
  rating?: QuestRating;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  note?: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  proofUrl?: string;
}
