import { PrismaClient, $Enums } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  for (const item of [
    {
      name: 'Dragon Slayer Badge',
      description: 'Awarded for epic community events',
      icon: '🐉',
      priceCoins: 0,
      priceGems: 0,
      type: $Enums.ItemType.BADGE,
    },
    {
      name: 'Swift Runner Badge',
      description: 'For guild running challenges',
      icon: '🏃',
      priceCoins: 500,
      priceGems: 0,
      type: $Enums.ItemType.BADGE,
    },
    {
      name: 'Zen Master Badge',
      description: 'Meditation mastery',
      icon: '🧘',
      priceCoins: 400,
      priceGems: 0,
      type: $Enums.ItemType.BADGE,
    },
  ]) {
    const exists = await prisma.item.findFirst({ where: { name: item.name } });
    if (!exists) {
      await prisma.item.create({ data: item });
    }
  }

  const rewardItem = await prisma.item.findFirst({
    where: { name: 'Dragon Slayer Badge' },
  });

  const now = new Date();
  const inTwoWeeks = new Date(now);
  inTwoWeeks.setDate(inTwoWeeks.getDate() + 14);

  for (const event of [
    {
      title: '🔥 Dragon Hunt',
      description:
        'The Crimson Dragon terrorizes the realm! Run collectively 10,000 km to defeat it.',
      icon: '🐉',
      targetValue: 10000,
      currentValue: 6780,
      unit: 'km',
      startDate: now,
      endDate: inTwoWeeks,
      rewardCoins: 500,
      rewardXp: 50,
      rewardItemId: rewardItem?.id,
    },
    {
      title: '📚 Library Crusade',
      description: 'Read 50,000 pages together and unlock ancient knowledge.',
      icon: '📖',
      targetValue: 50000,
      currentValue: 31200,
      unit: 'pages',
      startDate: now,
      endDate: inTwoWeeks,
      rewardCoins: 300,
      rewardXp: 30,
    },
  ]) {
    const exists = await prisma.event.findFirst({ where: { title: event.title } });
    if (!exists) {
      await prisma.event.create({ data: event });
    }
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
