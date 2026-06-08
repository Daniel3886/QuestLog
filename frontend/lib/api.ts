import { getAccessToken } from './auth';
import type {
  AuthTokens,
  FriendSummary,
  FriendRequest,
  GlobalEvent,
  Guild,
  GuildQuest,
  LobbyQuest,
  PublicQuest,
  RankedGuild,
  RankedUser,
  TavernComment,
  UserProfile,
} from './types';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}

async function parseError(res: Response): Promise<string> {
  try {
    const body = await res.json();
    if (Array.isArray(body.message)) {
      return body.message.join(', ');
    }
    if (typeof body.message === 'string') {
      return body.message;
    }
    return res.statusText || 'Request failed';
  } catch {
    return res.statusText || 'Request failed';
  }
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit & { auth?: boolean } = {},
): Promise<T> {
  const { auth = true, ...init } = options;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(init.headers as Record<string, string>),
  };

  if (auth) {
    const token = getAccessToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers,
  });

  if (!res.ok) {
    throw new ApiError(await parseError(res), res.status);
  }

  if (res.status === 204) {
    return undefined as T;
  }

  return res.json() as Promise<T>;
}

// Auth
export const authApi = {
  login: (email: string, password: string) =>
    apiFetch<AuthTokens>('/auth/login', {
      method: 'POST',
      auth: false,
      body: JSON.stringify({ email, password }),
    }),
  register: (data: {
    email: string;
    password: string;
    confirmPassword: string;
    username?: string;
  }) =>
    apiFetch<AuthTokens>('/auth/register', {
      method: 'POST',
      auth: false,
      body: JSON.stringify(data),
    }),
};

// Users
export const usersApi = {
  me: () => apiFetch<UserProfile>('/users/me'),
};

// Quests (lobby + public)
export const questsApi = {
  listPersonal: () => apiFetch<LobbyQuest[]>('/quests'),
  createPersonal: (body: Record<string, unknown>) =>
    apiFetch('/quests', { method: 'POST', body: JSON.stringify(body) }),
  updateProgress: (id: string, body: Record<string, unknown>) =>
    apiFetch(`/quests/${id}/progress`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    }),
  delete: (id: string) =>
    apiFetch(`/quests/${id}`, { method: 'DELETE' }),

  listPublic: (params?: { category?: string; sort?: string }) => {
    const q = new URLSearchParams();
    if (params?.category) q.set('category', params.category.toUpperCase());
    if (params?.sort) q.set('sort', params.sort);
    const qs = q.toString();
    return apiFetch<PublicQuest[]>(`/quests/public${qs ? `?${qs}` : ''}`, {
      auth: false,
    });
  },
  createPublic: (body: Record<string, unknown>) =>
    apiFetch<PublicQuest>('/quests/public', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  joinPublic: (id: string) =>
    apiFetch(`/quests/public/${id}/join`, { method: 'POST' }),
  updatePublicProgress: (questId: string, value: number, note?: string, proofUrl?: string) =>
  apiFetch(`/quests/public/${questId}/progress`, {
    method: 'PATCH',
    body: JSON.stringify({ currentValue: value, note, proofUrl }),
  }),
  updatePersonal: (id: string, body: Record<string, unknown>) =>
    apiFetch(`/quests/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    }),
};

// Events
export const eventsApi = {
  list: () =>
    apiFetch<GlobalEvent[]>('/events', { auth: false }).then((events) =>
      events.map((e) => ({
        ...e,
        rewardItemName: e.rewardItemName ?? '',
      })),
    ),
  join: (id: string) => apiFetch(`/events/${id}/join`, { method: 'POST' }),
  contribute: (id: string, amount: number) =>
    apiFetch<GlobalEvent & { rewardsGranted?: boolean }>(
      `/events/${id}/contribute`,
      {
        method: 'POST',
        body: JSON.stringify({ amount }),
      },
    ),
};

// Comments
export const commentsApi = {
  list: (targetType: string, targetId: string) =>
    apiFetch<TavernComment[]>(
      `/comments?targetType=${targetType}&targetId=${encodeURIComponent(targetId)}`,
      { auth: false },
    ),
  create: (targetType: string, targetId: string, content: string) =>
    apiFetch<TavernComment>('/comments', {
      method: 'POST',
      body: JSON.stringify({ targetType, targetId, content }),
    }),
  report: (commentId: string, content?: string) =>
    apiFetch(`/comments/${commentId}/report`, {
      method: 'PATCH',
      body: JSON.stringify({ content }),
    }),
};

export const friendsApi = {
  list: () => apiFetch<FriendSummary[]>('/friends'),
  listPending: () => apiFetch<FriendRequest[]>('/friends/pending'),  // new
  request: (email: string) =>
    apiFetch('/friends/request', {
      method: 'POST',
      body: JSON.stringify({ friendEmail: email }),
    }),
  accept: (requestId: string) =>
    apiFetch(`/friends/${requestId}/accept`, { method: 'PATCH' }),   // changed param
  remove: (friendId: string) =>
    apiFetch(`/friends/${friendId}`, { method: 'DELETE' }),
};

export const reportsApi = {
  create: (
    reportedType: string,
    reportedId: string,
    content?: string,
  ) =>
    apiFetch('/reports', {
      method: 'POST',
      body: JSON.stringify({ reportedType, reportedId, content }),
    }),
  list: () => apiFetch('/reports'),
};

// Guilds
export const guildsApi = {
  me: () => apiFetch<Guild | null>('/guilds/me'),
  create: (body: { name: string; description?: string; avatar?: string }) =>
    apiFetch<Guild>('/guilds', { method: 'POST', body: JSON.stringify(body) }),
  createQuest: (guildId: string, body: Record<string, unknown>) =>
    apiFetch<GuildQuest>(`/guilds/${guildId}/quests`, {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  voteQuest: (guildId: string, questId: string) =>
    apiFetch<GuildQuest>(`/guilds/${guildId}/quests/${questId}/vote`, {
      method: 'POST',
    }),
  logProgress: (guildId: string, questId: string, amount: number, note?: string) =>
    apiFetch<GuildQuest>(`/guilds/${guildId}/quests/${questId}/progress`, {
      method: 'POST',
      body: JSON.stringify({ amount, note }),
    }),
};

// Leaderboards
export const leaderboardsApi = {
  users: (metric = 'streak') =>
    apiFetch<RankedUser[]>(`/leaderboards/users?metric=${metric}`, {
      auth: false,
    }),
  guilds: (metric = 'level') =>
    apiFetch<RankedGuild[]>(`/leaderboards/guilds?metric=${metric}`, {
      auth: false,
    }),
  myRank: (metric = 'streak') =>
    apiFetch<RankedUser | null>(`/leaderboards/users/me?metric=${metric}`),
};
