import 'dotenv/config';
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, $Enums } from '@prisma/client';

// Use type assertion to bypass TypeScript error
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
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

  // Boosts (temporary power-ups, if you implement them later)
  {
    name: 'Double XP Boost (24h)',
    description: 'Earn double XP from all quests for 24 hours.',
    icon: '⚡',
    priceCoins: 1000,
    priceGems: 0,
    type: $Enums.ItemType.BOOST,
  },
  {
    name: 'Streak Shield',
    description: 'Protect your streak from one missed day.',
    icon: '🛡️',
    priceCoins: 300,
    priceGems: 0,
    type: $Enums.ItemType.BOOST,
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