import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import {
  QuestFrequency,
  QuestProofRequired,
  QuestTrackingType,
} from '@prisma/client';

export class UpdateQuestDto {
  @IsString()
  @IsOptional()
  @MaxLength(120)
  title?: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;

  @IsEnum(QuestTrackingType)
  @IsOptional()
  trackingType?: QuestTrackingType;

  @IsString()
  @IsOptional()
  @MaxLength(40)
  unit?: string;

  @IsNumber()
  @Min(1)
  @IsOptional()
  targetValue?: number;

  @IsEnum(QuestProofRequired)
  @IsOptional()
  proofRequired?: QuestProofRequired;

  @IsEnum(QuestFrequency)
  @IsOptional()
  frequency?: QuestFrequency;
}
