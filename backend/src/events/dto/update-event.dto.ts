import { IsDateString, IsInt, IsOptional, IsPositive, IsString } from 'class-validator';

export class UpdateEventDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  icon?: string;

  @IsInt()
  @IsPositive()
  @IsOptional()
  targetValue?: number;

  @IsString()
  @IsOptional()
  unit?: string;

  @IsDateString()
  @IsOptional()
  startDate?: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;

  @IsInt()
  @IsPositive()
  @IsOptional()
  rewardXp?: number;

  @IsInt()
  @IsPositive()
  @IsOptional()
  rewardCoins?: number;
}
