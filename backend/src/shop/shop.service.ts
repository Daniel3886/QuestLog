import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { $Enums } from '@prisma/client';
import { DatabaseService } from '../database/database.service';
import { PurchaseItemDto } from './dto/purchase-item.dto';

@Injectable()
export class ShopService {
  constructor(private readonly database: DatabaseService) {}

  async listItems() {
    const items = await this.database.prisma.item.findMany({
      orderBy: { priceCoins: 'asc' },
    });

    return items.map((item) => ({
      id: item.id,
      name: item.name,
      description: item.description,
      priceCoins: item.priceCoins,
      priceGems: item.priceGems,
      type: item.type.toLowerCase(),
      icon: item.icon,
      fileUrl: item.fileUrl,
    }));
  }

  async getInventory(userId: string, ownerType?: $Enums.OwnerType, guildId?: string) {
    const type = ownerType ?? $Enums.OwnerType.USER;
    const ownerId = type === $Enums.OwnerType.GUILD ? guildId : userId;

    if (!ownerId) {
      throw new BadRequestException('ownerId is required');
    }
    if (type === $Enums.OwnerType.GUILD) {
      await this.ensureGuildMember(ownerId, userId);
    }

    return this.database.prisma.inventory.findMany({
      where: { ownerId, ownerType: type },
      include: { item: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async purchase(userId: string, dto: PurchaseItemDto) {
    const item = await this.database.prisma.item.findUnique({
      where: { id: dto.itemId },
    });
    if (!item) {
      throw new NotFoundException('Item not found');
    }

    const ownerType = dto.ownerType ?? $Enums.OwnerType.USER;
    const ownerId =
      ownerType === $Enums.OwnerType.GUILD ? dto.guildId : userId;

    if (!ownerId) {
      throw new BadRequestException('guildId is required for guild purchases');
    }

    if (ownerType === $Enums.OwnerType.GUILD) {
      await this.ensureGuildLeader(ownerId, userId);
      const guild = await this.database.prisma.guild.findUnique({
        where: { id: ownerId },
      });
      if (!guild || guild.gems < item.priceGems) {
        throw new BadRequestException('Not enough gems');
      }

      const [inventory] = await this.database.prisma.$transaction([
        this.database.prisma.inventory.create({
          data: { ownerId, ownerType, itemId: item.id },
          include: { item: true },
        }),
        this.database.prisma.guild.update({
          where: { id: ownerId },
          data: { gems: { decrement: item.priceGems } },
        }),
      ]);

      return inventory;
    }

    const user = await this.database.prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.coins < item.priceCoins) {
      throw new BadRequestException('Not enough coins');
    }

    const [inventory] = await this.database.prisma.$transaction([
      this.database.prisma.inventory.create({
        data: { ownerId: userId, ownerType, itemId: item.id },
        include: { item: true },
      }),
      this.database.prisma.user.update({
        where: { id: userId },
        data: { coins: { decrement: item.priceCoins } },
      }),
    ]);

    return inventory;
  }

  async setActive(userId: string, inventoryId: string, active: boolean) {
    const inv = await this.database.prisma.inventory.findUnique({
      where: { id: inventoryId },
      include: { item: true },
    });
    if (!inv) throw new NotFoundException('Inventory item not found');
    if (inv.ownerId !== userId) throw new ForbiddenException();

    if (active && inv.item.type === 'BADGE') {
      const activeCount = await this.database.prisma.inventory.count({
        where: {
          ownerId: userId,
          ownerType: 'USER',
          active: true,
          item: { type: 'BADGE' },
        },
      });
      if (activeCount >= 3) {
        throw new BadRequestException('You can only activate up to 3 badges');
      }
    }

    await this.database.prisma.inventory.update({
      where: { id: inventoryId },
      data: { active },
    });
    return { success: true };
  }

  private async ensureGuildMember(guildId: string, userId: string) {
    const member = await this.database.prisma.guildMember.findFirst({
      where: { guildId, userId },
    });
    if (!member) {
      throw new ForbiddenException('Not a guild member');
    }
  }

  private async ensureGuildLeader(guildId: string, userId: string) {
    const member = await this.database.prisma.guildMember.findFirst({
      where: { guildId, userId },
    });
    if (!member || member.role !== $Enums.GuildMemberRole.LEADER) {
      throw new ForbiddenException('Guild leader access required');
    }
  }
}
