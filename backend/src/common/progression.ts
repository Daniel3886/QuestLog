/** Lifetime XP needed per level tier (flat 100 XP per level). */
export const USER_XP_PER_LEVEL = 100;

/**
 * Derives level from total lifetime XP.
 * Example: 1234 total → level 12, 34 XP into current level, 66 XP to next.
 */
export function deriveUserLevel(totalXp: number) {
  const safeTotal = Math.max(0, Math.floor(totalXp));
  const level = Math.max(1, Math.floor(safeTotal / USER_XP_PER_LEVEL));
  const xpIntoLevel = safeTotal % USER_XP_PER_LEVEL;

  return {
    level,
    xp: xpIntoLevel,
    xpToNext: USER_XP_PER_LEVEL - xpIntoLevel,
    totalXp: safeTotal,
  };
}

export function addUserTotalXp(currentTotalXp: number, gainedXp: number) {
  return Math.max(0, Math.floor(currentTotalXp + gainedXp));
}

/** XP required for the next guild level (guilds page). */
export function guildXpToNextLevel(level: number): number {
  return level * 1000;
}

export function applyGuildXp(
  currentLevel: number,
  currentXp: number,
  gainedXp: number,
) {
  let level = currentLevel;
  let xp = currentXp + gainedXp;

  while (xp >= guildXpToNextLevel(level)) {
    xp -= guildXpToNextLevel(level);
    level += 1;
  }

  return { level, xp };
}
