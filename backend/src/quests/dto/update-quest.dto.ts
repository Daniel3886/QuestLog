import { $Enums } from '@prisma/client';
import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
export class UpdateQuestDto {
  @IsString()
  @IsOptional()
  @MaxLength(120)
  title?: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;

  @IsEnum($Enums.QuestTrackingType)
  @IsOptional()
  trackingType?: $Enums.QuestTrackingType;

  @IsString()
  @IsOptional()
  @MaxLength(40)
  unit?: string;

  @IsNumber()
  @Min(1)
  @IsOptional()
  targetValue?: number;

  @IsEnum($Enums.QuestProofRequired)
  @IsOptional()
  proofRequired?: $Enums.QuestProofRequired;

  @IsEnum($Enums.QuestFrequency)
  @IsOptional()
  frequency?: $Enums.QuestFrequency;
}
