import { IsEnum, IsOptional, IsUUID } from 'class-validator';
import { $Enums } from '@prisma/client';

export class PurchaseItemDto {
  @IsUUID()
  itemId!: string;

  @IsEnum($Enums.OwnerType)
  @IsOptional()
  ownerType?: $Enums.OwnerType;

  @IsUUID()
  @IsOptional()
  guildId?: string;
}
