import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient, $Enums } from '@prisma/client';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  // --------------------------------------------
  // 1. Shop Items
  // --------------------------------------------
  const shopItems = [
    // Avatar items
    {
      name: 'Pixel Knight Helmet',
      description: 'A shiny pixel helmet for your profile picture.',
      icon: '🪖',
      priceCoins: 200,
      priceGems: 0,
      type: $Enums.ItemType.AVATAR,
    },
    {
      name: 'Mage Robe',
      description: 'Enchanted robes for the wise.',
      icon: '🧙',
      priceCoins: 300,
      priceGems: 0,
      type: $Enums.ItemType.AVATAR,
    },
    {
      name: 'Dragon Wings',
      description: 'Show off your draconic side.',
      icon: '🦅',
      priceCoins: 800,
      priceGems: 0,
      type: $Enums.ItemType.AVATAR,
    },
    // Cosmetic / profile decorations
    {
      name: 'Glow Ring',
      description: 'Adds a mystical glow to your profile border.',
      icon: '💍',
      priceCoins: 150,
      priceGems: 0,
      type: $Enums.ItemType.COSMETIC,
    },
    {
      name: 'Golden Frame',
      description: 'Premium golden border for your avatar.',
      icon: '🖼️',
      priceCoins: 500,
      priceGems: 0,
      type: $Enums.ItemType.COSMETIC,
    },
    {
      name: 'Sparkle Effect',
      description: 'Leave a trail of sparkles wherever you comment.',
      icon: '✨',
      priceCoins: 400,
      priceGems: 0,
      type: $Enums.ItemType.COSMETIC,
    },
    {
      name: 'Guild Shield',
      description: 'Show your guild pride with this exclusive badge.',
      icon: '🛡️',
      priceCoins: 0,
      priceGems: 100,
      type: $Enums.ItemType.BADGE,
    },
    {
      name: 'User Shield',
      description: 'Show your user pride with this exclusive badge.',
      icon: '🛡️',
      priceCoins: 100,
      priceGems: 0,
      type: $Enums.ItemType.BADGE,
    },
    // Theme cosmetics (unlockable color schemes)
    {
      name: 'Pixel Light Theme',
      description: 'A bright, paper‑like theme for the whole interface.',
      icon: '☀️',
      priceCoins: 300,
      priceGems: 0,
      type: $Enums.ItemType.COSMETIC,
    },
    {
      name: 'Retro Neon Theme',
      description: 'Glowing neon colours for a cyberpunk vibe.',
      icon: '💚',
      priceCoins: 500,
      priceGems: 0,
      type: $Enums.ItemType.COSMETIC,
    },
  ];

  for (const item of shopItems) {
    const exists = await prisma.item.findFirst({ where: { name: item.name } });
    if (!exists) {
      await prisma.item.create({ data: item });
    }
  }

  console.log('Seeding completed.');
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });