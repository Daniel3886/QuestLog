import { IsDateString, IsInt, IsNotEmpty, IsOptional, IsPositive, IsString } from 'class-validator';

export class CreateEventDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsNotEmpty()
  icon!: string;

  @IsInt()
  @IsPositive()
  targetValue!: number;

  @IsString()
  @IsOptional()
  unit?: string;

  @IsDateString()
  startDate!: string;

  @IsDateString()
  endDate!: string;

  @IsInt()
  @IsPositive()
  rewardXp!: number;

  @IsInt()
  @IsPositive()
  rewardCoins!: number;
}
