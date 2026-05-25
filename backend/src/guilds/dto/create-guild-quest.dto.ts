import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';
import { $Enums } from '@prisma/client';

export class CreateGuildQuestDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  title!: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;

  @IsEnum($Enums.GuildQuestType)
  @IsOptional()
  questType?: $Enums.GuildQuestType;

  @IsEnum($Enums.QuestTrackingType)
  @IsOptional()
  trackingType?: $Enums.QuestTrackingType;

  @IsString()
  @IsOptional()
  @MaxLength(40)
  unit?: string;

  @IsNumber()
  @Min(1)
  targetValue!: number;

  @IsInt()
  @Min(0)
  @IsOptional()
  rewardGems?: number;

  @IsUUID()
  @IsOptional()
  rewardItemId?: string;

  @IsDateString()
  @IsOptional()
  startDate?: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;
}
