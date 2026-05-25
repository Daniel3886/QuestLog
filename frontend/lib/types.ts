export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface UserProfile {
  id: string;
  email: string;
  username: string;
  bio: string | null;
  avatar: string;
  level: number;
  xp: number;
  xpNext: number;
  totalXp?: number;
  coins: number;
  streak: number;
  weekStreak: number;
  totalQuests: number;
  questsCompleted?: number;
  completedToday: number;
  dailyQuestCount: number;
}

export interface LobbyQuest {
  id: string;
  title: string;
  description: string;
  type: 'daily' | 'weekly' | 'custom';
  trackingType: 'binary' | 'numeric' | 'timer';
  targetValue: number;
  currentValue: number;
  unit: string;
  streak: number;
  icon: string;
  todayComplete?: boolean;
}

export interface GlobalEvent {
  id: string;
  title: string;
  description: string | null;
  currentValue: number;
  targetValue: number;
  unit: string;
  endDate: string;
  participants: number;
  rewardCoins: number;
  rewardXp?: number;
  rewardItemName: string | null;
  icon: string;
  status: 'active' | 'ending-soon' | 'completed';
}

export interface PublicQuest {
  id: string;
  title: string;
  description: string;
  author: string;
  authorAvatar: string;
  category: string;
  difficulty: string;
  trackingType: string;
  targetValue: number;
  unit: string;
  participants: number;
  rating: number;
  createdAt: string;
  icon: string;
}

export interface TavernComment {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  content: string;
  createdAt: string;
  reported: boolean;
}

export interface GuildMember {
  id: string;
  userId: string;
  username: string;
  avatar: string;
  role: 'leader' | 'member';
  joinedAt: string;
  contribution: number;
  streak: number;
}

export interface GuildQuest {
  id: string;
  title: string;
  description: string | null;
  type: string;
  trackingType: string;
  targetValue: number;
  currentValue: number;
  unit: string;
  status: string;
  votes: number;
  totalMembers: number;
  startDate: string | null;
  endDate: string | null;
  rewardGems: number;
  rewardItemName: string | null;
  createdBy: string;
  createdAt: string;
}

export interface GuildBadge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earnedAt: string;
}

export interface Guild {
  id: string;
  name: string;
  description: string | null;
  avatar: string;
  level: number;
  xp: number;
  xpNext: number;
  gems: number;
  members: GuildMember[];
  activeQuests?: GuildQuest[];
  completedQuests?: GuildQuest[];
  badges?: GuildBadge[];
  createdAt: string;
  currentUserRole?: string;
}

export interface RankedUser {
  id: string;
  rank: number;
  username: string;
  avatar: string;
  level: number;
  streak: number;
  coins: number;
  totalQuests: number;
  totalXp: number;
}

export interface RankedGuild {
  id: string;
  rank: number;
  name: string;
  avatar: string;
  level: number;
  gems: number;
  members: number;
  totalQuests: number;
  totalXp: number;
}
