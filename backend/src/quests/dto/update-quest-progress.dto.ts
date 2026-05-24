import { $Enums } from '@prisma/client';
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
  currentValue!: number;

  @IsEnum($Enums.QuestRating)
  @IsOptional()
  rating?: $Enums.QuestRating;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  note?: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  proofUrl?: string;
}
