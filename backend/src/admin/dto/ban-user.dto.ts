import { IsString, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

export class BanUserDto {
  @IsString()
  @IsNotEmpty()
  reason!: string;

  @IsUUID()
  @IsOptional()
  reportedItemId?: string; // optional link to a report
}