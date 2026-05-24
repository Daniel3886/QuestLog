import {
  IsEnum,
  IsNumber,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

import { $Enums } from '@prisma/client';

export class CreateQuestDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  title!: string;

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
  targetValue!: number;

  @IsEnum($Enums.QuestProofRequired)
  @IsOptional()
  proofRequired?: $Enums.QuestProofRequired;

  @IsEnum($Enums.QuestFrequency)
  @IsOptional()
  frequency?: $Enums.QuestFrequency;
}
