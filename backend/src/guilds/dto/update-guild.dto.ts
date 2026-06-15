import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateGuildDto {
  @IsString()
  @IsOptional()
  @MaxLength(80)
  name?: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;

  @IsString()
  @IsOptional()
  avatar?: string;
}
