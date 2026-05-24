import type { Quest } from '@prisma/client';

const frequencyToType: Record<string, string> = {
  DAILY: 'daily',
  WEEKLY: 'weekly',
  CUSTOM: 'custom',
};

export function formatQuestForLobby(
  quest: Quest,
  stats: {
    todayProgress: number;
    todayComplete: boolean;
    currentStreak: number;
  },
) {
  return {
    id: quest.id,
    title: quest.title,
    description: quest.description ?? '',
    type: frequencyToType[quest.frequency] ?? 'daily',
    trackingType: quest.trackingType.toLowerCase(),
    targetValue: quest.targetValue,
    currentValue: stats.todayProgress,
    unit: quest.unit ?? 'times',
    streak: stats.currentStreak,
    icon: quest.icon,
    todayComplete: stats.todayComplete,
    proofRequired: quest.proofRequired.toLowerCase(),
  };
}

export function formatPublicQuest(
  quest: Quest & {
    creator: { username: string; avatar: string };
    _count: { personalQuests: number };
  },
) {
  return {
    id: quest.id,
    title: quest.title,
    description: quest.description ?? '',
    author: quest.creator.username,
    authorAvatar: quest.creator.avatar,
    category: quest.category?.toLowerCase() ?? 'other',
    difficulty: quest.difficulty?.toLowerCase() ?? 'medium',
    trackingType: quest.trackingType.toLowerCase(),
    targetValue: quest.targetValue,
    unit: quest.unit ?? 'times',
    participants: quest._count.personalQuests,
    rating: quest.ratingCount > 0 ? quest.averageRating : 0,
    createdAt: quest.createdAt,
    icon: quest.icon,
  };
}
