/**
 * XP / level / rank helpers — ported from the Mnemos design's renderVals.
 */

export const XP_PER_LEVEL = 400;

export const RANKS = [
  'Novice',
  'Apprentice',
  'Adept',
  'Mnemonist',
  'Memory Athlete',
  'Grandmaster',
] as const;

export function levelForXp(xp: number): number {
  return 1 + Math.floor(xp / XP_PER_LEVEL);
}

export function xpInto(xp: number): number {
  return xp % XP_PER_LEVEL;
}

export function xpPct(xp: number): number {
  return Math.round((xpInto(xp) / XP_PER_LEVEL) * 100);
}

export function rankForLevel(level: number): string {
  return RANKS[Math.min(level - 1, RANKS.length - 1)] || 'Mnemonist';
}

/** Greeting by hour-of-day (design: greeting). Pass a Date for testability. */
export function greetingFor(now: Date = new Date()): string {
  const hr = now.getHours();
  if (hr < 12) return 'Good morning';
  if (hr < 18) return 'Good afternoon';
  return 'Good evening';
}
