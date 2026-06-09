import { IsString, IsNotEmpty } from 'class-validator';

export class CreateBugReportDto {
  @IsString()
  @IsNotEmpty()
  description!: string;
}