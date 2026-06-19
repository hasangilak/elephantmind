/**
 * Global persisted progress store (Zustand + AsyncStorage).
 *
 * Holds only cross-screen, durable progress — XP, streak, the spaced-repetition
 * deck, discipline bests and session history. Per-round flow state (the Numbers /
 * Palace phase machines and the active Review session) is local to each screen.
 *
 * Seed values mirror the Mnemos design's starting state so a fresh install looks
 * like the prototype; once played, everything updates and persists for real.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { PEGS_LEARNED_BASE, SEED_SR_CARDS } from '@/data/content';
import type { NumbersScore } from '@/engine/digits';
import type { PalaceScore } from '@/engine/palace';
import { reviewCard, srOffset, type SrCard } from '@/engine/sr';

const DAY_MS = 86_400_000;

function startOfDay(ts: number): number {
  const d = new Date(ts);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

/** Mon-first weekday index (0=Mon … 6=Sun) for the weekly-activity bars. */
export function weekdayIndex(now: number = Date.now()): number {
  return (new Date(now).getDay() + 6) % 7;
}

export interface RecentSession {
  mode: string;
  score: string;
  xp: number;
  ts: number;
}

export interface NumbersBest {
  digits: number;
  timeSec: number;
}
export interface PalaceBest {
  words: number;
  timeSec: number;
}

export interface ProgressState {
  hydrated: boolean;
  xp: number;
  streak: number;
  lastPlayedISO: string | null;
  srCards: SrCard[];
  srDay: number;
  numbersBest: NumbersBest | null;
  palaceBest: PalaceBest | null;
  recent: RecentSession[];
  /** Activity counts, Mon..Sun. */
  week: number[];

  // actions
  recordNumbers(score: NumbersScore, elapsedSec: number): void;
  recordPalace(score: PalaceScore, elapsedSec: number): void;
  reviewSr(n: string, gotIt: boolean): void;
  finishReview(gotCount: number): void;
  advanceSrDay(days: number): void;
  resetProgress(): void;
}

function makeSeed() {
  const now = Date.now();
  return {
    xp: 1240,
    streak: 6,
    lastPlayedISO: new Date(startOfDay(now)).toISOString(),
    srCards: SEED_SR_CARDS.map((c) => ({ ...c })),
    srDay: 0,
    numbersBest: { digits: 40, timeSec: 52 } as NumbersBest,
    palaceBest: { words: 12, timeSec: 130 } as PalaceBest,
    week: [3, 5, 2, 6, 4, 7, 5],
    recent: [
      { mode: 'Numbers', score: '34 / 40 digits', xp: 180, ts: now - 5 * 3600_000 },
      { mode: 'Words · Palace', score: '11 / 12 words', xp: 132, ts: now - 6 * 3600_000 },
      { mode: 'Review', score: '8 images', xp: 64, ts: now - 1 * DAY_MS },
      { mode: 'Images', score: '18 / 30', xp: 150, ts: now - 2 * DAY_MS },
    ] as RecentSession[],
  };
}

/** Update streak from the last-played day; returns the new streak + ISO. */
function bumpStreak(lastISO: string | null, streak: number, now: number) {
  const today = startOfDay(now);
  if (lastISO) {
    const last = startOfDay(new Date(lastISO).getTime());
    if (last === today) return { streak, iso: new Date(today).toISOString() };
    if (last === today - DAY_MS) return { streak: streak + 1, iso: new Date(today).toISOString() };
  }
  return { streak: 1, iso: new Date(today).toISOString() };
}

function pushRecent(recent: RecentSession[], entry: RecentSession): RecentSession[] {
  return [entry, ...recent].slice(0, 12);
}

export const useProgress = create<ProgressState>()(
  persist(
    (set, get) => ({
      hydrated: false,
      ...makeSeed(),

      recordNumbers: (score, elapsedSec) =>
        set((s) => {
          const now = Date.now();
          const { streak, iso } = bumpStreak(s.lastPlayedISO, s.streak, now);
          const week = [...s.week];
          week[weekdayIndex(now)] += 1;
          const best =
            !s.numbersBest || score.lead > s.numbersBest.digits
              ? { digits: score.lead, timeSec: elapsedSec }
              : s.numbersBest;
          return {
            xp: s.xp + score.xpGain,
            streak,
            lastPlayedISO: iso,
            week,
            numbersBest: best,
            recent: pushRecent(s.recent, {
              mode: 'Numbers',
              score: `${score.lead} / ${score.total} digits`,
              xp: score.xpGain,
              ts: now,
            }),
          };
        }),

      recordPalace: (score, elapsedSec) =>
        set((s) => {
          const now = Date.now();
          const { streak, iso } = bumpStreak(s.lastPlayedISO, s.streak, now);
          const week = [...s.week];
          week[weekdayIndex(now)] += 1;
          const best =
            !s.palaceBest || score.correct > s.palaceBest.words
              ? { words: score.correct, timeSec: elapsedSec }
              : s.palaceBest;
          return {
            xp: s.xp + score.xpGain,
            streak,
            lastPlayedISO: iso,
            week,
            palaceBest: best,
            recent: pushRecent(s.recent, {
              mode: 'Words · Palace',
              score: `${score.correct} / ${score.total} words`,
              xp: score.xpGain,
              ts: now,
            }),
          };
        }),

      reviewSr: (n, gotIt) =>
        set((s) => ({
          srCards: s.srCards.map((c) => (c.n === n ? reviewCard(c, s.srDay, gotIt) : c)),
        })),

      finishReview: (gotCount) =>
        set((s) => {
          if (gotCount <= 0) return {} as Partial<ProgressState>;
          const now = Date.now();
          const { streak, iso } = bumpStreak(s.lastPlayedISO, s.streak, now);
          const week = [...s.week];
          week[weekdayIndex(now)] += 1;
          return {
            xp: s.xp + gotCount * 8,
            streak,
            lastPlayedISO: iso,
            week,
            recent: pushRecent(s.recent, {
              mode: 'Review',
              score: `${gotCount} image${gotCount === 1 ? '' : 's'}`,
              xp: gotCount * 8,
              ts: now,
            }),
          };
        }),

      advanceSrDay: (days) => set((s) => ({ srDay: s.srDay + days })),

      resetProgress: () => set(() => ({ ...makeSeed() })),
    }),
    {
      name: 'mnemos-progress-v1',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: ({ hydrated, ...rest }) => rest,
      onRehydrateStorage: () => (state) => {
        useProgress.setState({ hydrated: true });
      },
    },
  ),
);

/** Pegs "learned" = SR cards at stage ≥ 1 plus the design's learned baseline. */
export function pegsLearned(srCards: SrCard[]): number {
  return srCards.filter((c) => c.stage >= 1).length + PEGS_LEARNED_BASE;
}

/** Human "when" label for a recent-session timestamp. */
export function formatWhen(ts: number, now: number = Date.now()): string {
  const diff = Math.floor((startOfDay(now) - startOfDay(ts)) / DAY_MS);
  if (diff <= 0) {
    const d = new Date(ts);
    let h = d.getHours();
    const m = d.getMinutes();
    const ap = h >= 12 ? 'pm' : 'am';
    h = h % 12 || 12;
    return `Today · ${h}:${m < 10 ? '0' : ''}${m}${ap}`;
  }
  if (diff === 1) return 'Yesterday';
  return `${diff} days ago`;
}

export { srOffset };
