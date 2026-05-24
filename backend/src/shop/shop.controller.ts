import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { $Enums } from '@prisma/client';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { User } from 'src/auth/decorators/user.decorator';
import type { AuthUser } from 'src/auth/types/auth-user.type';
import { PurchaseItemDto } from './dto/purchase-item.dto';
import { SetActiveDto } from './dto/set-active.dto';
import { ShopService } from './shop.service';

@Controller('shop')
export class ShopController {
  constructor(private readonly shopService: ShopService) {}

  @Get('items')
  listItems() {
    return this.shopService.listItems();
  }

  @UseGuards(JwtAuthGuard)
  @Get('inventory')
  getInventory(
    @User() user: AuthUser,
    @Query('ownerType') ownerType?: $Enums.OwnerType,
    @Query('guildId') guildId?: string,
  ) {
    return this.shopService.getInventory(user.id, ownerType, guildId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('purchase')
  purchase(@User() user: AuthUser, @Body() dto: PurchaseItemDto) {
    return this.shopService.purchase(user.id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('inventory/:id/active')
  setActive(
    @User() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: SetActiveDto,
  ) {
    return this.shopService.setActive(user.id, id, dto.active);
  }
}
