import { IsString, IsOptional, IsIn } from 'class-validator';

export class UpdateBugReportDto {
  @IsString()
  @IsIn(['new', 'in_progress', 'completed'])
  status!: string;

  @IsString()
  @IsOptional()
  answer?: string;
}