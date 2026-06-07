export function toEnum<T extends string>(value: string): T {
  return value.toUpperCase() as T;
}

export const frequencyMap = {
  daily: 'DAILY',
  weekly: 'WEEKLY',
  custom: 'CUSTOM',
} as const;

export const trackingMap: Record<
  'binary' | 'numeric' | 'timer',
  'BINARY' | 'NUMERIC' | 'TIMER'
> = {
  binary: 'BINARY',
  numeric: 'NUMERIC',
  timer: 'TIMER',
};

export const proofRequiredMap: Record<'none' | 'text' | 'image', 'NONE' | 'TEXT' | 'IMAGE'> = {
  none: 'NONE',
  text: 'TEXT',
  image: 'IMAGE',
};

export const categoryMap = {
  fitness: 'FITNESS',
  education: 'EDUCATION',
  creativity: 'CREATIVITY',
  wellness: 'WELLNESS',
  other: 'OTHER',
} as const;

export const difficultyMap = {
  easy: 'EASY',
  medium: 'MEDIUM',
  hard: 'HARD',
} as const;

export const guildQuestTypeMap = {
  summative: 'SUMMATIVE',
  concurrent: 'CONCURRENT',
  streak: 'STREAK',
} as const;
