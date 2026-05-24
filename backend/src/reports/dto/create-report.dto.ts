import { IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { $Enums } from '@prisma/client';

export class CreateReportDto {
  @IsEnum($Enums.ReportedType)
  reportedType!: $Enums.ReportedType;

  @IsString()
  @IsNotEmpty()
  @MaxLength(64)
  reportedId!: string;

  @IsString()
  @IsOptional()
  @MaxLength(1000)
  content?: string;
}
