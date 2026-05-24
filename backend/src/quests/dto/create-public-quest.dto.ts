import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { $Enums } from '@prisma/client';

export class CreatePublicQuestDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  title!: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;

  @IsString()
  @IsOptional()
  @MaxLength(8)
  icon?: string;

  @IsEnum($Enums.QuestCategory)
  category!: $Enums.QuestCategory;

  @IsEnum($Enums.QuestDifficulty)
  @IsOptional()
  difficulty?: $Enums.QuestDifficulty;

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
}
