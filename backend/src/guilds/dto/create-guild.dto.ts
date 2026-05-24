import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateGuildDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(80)
  name!: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;

  @IsString()
  @IsOptional()
  @MaxLength(8)
  avatar?: string;
}
