import { IsNumber, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class LogGuildProgressDto {
  @IsNumber()
  @Min(0)
  amount!: number;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  note?: string;
}
