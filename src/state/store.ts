/**
 * Global persisted progress store (Zustand + AsyncStorage).
 *
 * Holds only cross-screen, durable progress — XP, streak, the spaced-repetition
 * deck, discipline bests and session history. Per-round flow state (the Numbers /
 * Palace phase machines and the active Review session) is local to each screen.
 *
 * A fresh install starts at zero: no XP, no streak, no bests, empty history, and
 * the full 100 number-images seeded as "new" cards to learn via spaced repetition.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { differenceInCalendarDays, format, getDay, startOfDay } from 'date-fns';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { DEFAULT_PALACE } from '@/data/content';
import { PEGS } from '@/data/majorSystem';
import type { NumbersScore } from '@/engine/digits';
import type { PalaceScore } from '@/engine/palace';
import { reviewCard, srOffset, type SrCard } from '@/engine/sr';

/** Mon-first weekday index (0=Mon … 6=Sun) for the weekly-activity bars. */
export function weekdayIndex(now: number = Date.now()): number {
  return (getDay(now) + 6) % 7;
}

/** Whole calendar-day index (local) since the epoch, for real-date scheduling. */
export function todayEpochDay(now: number = Date.now()): number {
  return differenceInCalendarDays(now, 0);
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
export interface ImagesBest {
  correct: number;
  timeSec: number;
}
export interface CardsBest {
  correct: number;
  timeSec: number;
}

export interface Settings {
  haptics: boolean;
  reminders: boolean;
  reduceMotion: boolean;
}

/** A user-defined memory palace: an ordered list of loci (rooms). */
export interface Palace {
  id: string;
  name: string;
  loci: string[];
}

function newPalaceId(): string {
  return 'p' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

export interface ProgressState {
  hydrated: boolean;
  /** Display name shown on Home; editable in Settings, empty by default. */
  name: string;
  xp: number;
  streak: number;
  lastPlayedISO: string | null;
  srCards: SrCard[];
  numbersBest: NumbersBest | null;
  palaceBest: PalaceBest | null;
  imagesBest: ImagesBest | null;
  cardsBest: CardsBest | null;
  recent: RecentSession[];
  /** Activity counts, Mon..Sun. */
  week: number[];
  settings: Settings;
  /** Per-user overrides of card association words, keyed by card id. */
  cardWords: Record<string, string>;
  /** Preferred cards-per-story grouping (1–4). */
  cardCombo: number;
  /** User-defined memory palaces. */
  palaces: Palace[];
  /** Currently selected palace id. */
  activePalaceId: string;

  // actions
  recordNumbers(score: NumbersScore, elapsedSec: number): void;
  recordPalace(score: PalaceScore, elapsedSec: number): void;
  recordImages(correct: number, total: number, elapsedSec: number): void;
  recordCards(correct: number, total: number, elapsedSec: number): void;
  reviewSr(n: string, gotIt: boolean): void;
  finishReview(gotCount: number): void;
  setSetting<K extends keyof Settings>(key: K, value: Settings[K]): void;
  setName(name: string): void;
  setCardWord(id: number, word: string): void;
  setCardCombo(n: number): void;
  addPalace(name: string): string;
  updatePalace(id: string, patch: Partial<Pick<Palace, 'name' | 'loci'>>): void;
  deletePalace(id: string): void;
  setActivePalace(id: string): void;
  resetProgress(): void;
}

function makeSeed() {
  return {
    name: '',
    xp: 0,
    streak: 0,
    lastPlayedISO: null as string | null,
    // The whole 00–99 system starts as "new" cards to master via spaced repetition.
    srCards: PEGS.map((p) => ({ n: p.n, stage: 0, due: 0 })) as SrCard[],
    numbersBest: null as NumbersBest | null,
    palaceBest: null as PalaceBest | null,
    imagesBest: null as ImagesBest | null,
    cardsBest: null as CardsBest | null,
    cardWords: {} as Record<string, string>,
    cardCombo: 3,
    palaces: [{ id: 'default', name: DEFAULT_PALACE.name, loci: [...DEFAULT_PALACE.loci] }] as Palace[],
    activePalaceId: 'default',
    week: [0, 0, 0, 0, 0, 0, 0],
    recent: [] as RecentSession[],
    settings: { haptics: true, reminders: false, reduceMotion: false } as Settings,
  };
}

/** Update streak from the last-played day; returns the new streak + ISO. */
function bumpStreak(lastISO: string | null, streak: number, now: number) {
  const today = startOfDay(now);
  const iso = today.toISOString();
  if (lastISO) {
    const diff = differenceInCalendarDays(today, new Date(lastISO));
    if (diff === 0) return { streak, iso };
    if (diff === 1) return { streak: streak + 1, iso };
  }
  return { streak: 1, iso };
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
        set((s) => {
          const day = todayEpochDay();
          return { srCards: s.srCards.map((c) => (c.n === n ? reviewCard(c, day, gotIt) : c)) };
        }),

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

      recordImages: (correct, total, elapsedSec) =>
        set((s) => {
          const now = Date.now();
          const { streak, iso } = bumpStreak(s.lastPlayedISO, s.streak, now);
          const week = [...s.week];
          week[weekdayIndex(now)] += 1;
          const xpGain = correct * 6;
          const best =
            !s.imagesBest || correct > s.imagesBest.correct
              ? { correct, timeSec: elapsedSec }
              : s.imagesBest;
          return {
            xp: s.xp + xpGain,
            streak,
            lastPlayedISO: iso,
            week,
            imagesBest: best,
            recent: pushRecent(s.recent, {
              mode: 'Images',
              score: `${correct} / ${total}`,
              xp: xpGain,
              ts: now,
            }),
          };
        }),

      recordCards: (correct, total, elapsedSec) =>
        set((s) => {
          const now = Date.now();
          const { streak, iso } = bumpStreak(s.lastPlayedISO, s.streak, now);
          const week = [...s.week];
          week[weekdayIndex(now)] += 1;
          const xpGain = correct * 4;
          const best =
            !s.cardsBest || correct > s.cardsBest.correct
              ? { correct, timeSec: elapsedSec }
              : s.cardsBest;
          return {
            xp: s.xp + xpGain,
            streak,
            lastPlayedISO: iso,
            week,
            cardsBest: best,
            recent: pushRecent(s.recent, {
              mode: 'Cards',
              score: `${correct} / ${total} cards`,
              xp: xpGain,
              ts: now,
            }),
          };
        }),

      setSetting: (key, value) => set((s) => ({ settings: { ...s.settings, [key]: value } })),

      setName: (name) => set(() => ({ name })),

      setCardWord: (id, word) =>
        set((s) => ({ cardWords: { ...s.cardWords, [id]: word } })),

      setCardCombo: (n) => set(() => ({ cardCombo: n })),

      addPalace: (name) => {
        const id = newPalaceId();
        set((s) => ({ palaces: [...s.palaces, { id, name: name.trim() || 'New palace', loci: [] }], activePalaceId: id }));
        return id;
      },

      updatePalace: (id, patch) =>
        set((s) => ({ palaces: s.palaces.map((p) => (p.id === id ? { ...p, ...patch } : p)) })),

      deletePalace: (id) =>
        set((s) => {
          if (s.palaces.length <= 1) return {} as Partial<ProgressState>; // always keep one
          const palaces = s.palaces.filter((p) => p.id !== id);
          const activePalaceId = s.activePalaceId === id ? palaces[0].id : s.activePalaceId;
          return { palaces, activePalaceId };
        }),

      setActivePalace: (id) => set(() => ({ activePalaceId: id })),

      // Reset progress but keep the user's name, settings, card system and palaces.
      resetProgress: () =>
        set((s) => ({
          ...makeSeed(),
          name: s.name,
          settings: s.settings,
          cardWords: s.cardWords,
          cardCombo: s.cardCombo,
          palaces: s.palaces,
          activePalaceId: s.activePalaceId,
        })),
    }),
    {
      name: 'elephantam-progress-v1',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: ({ hydrated, ...rest }) => rest,
      onRehydrateStorage: () => (state) => {
        useProgress.setState({ hydrated: true });
      },
    },
  ),
);

/** Pegs "learned" = SR cards that have advanced past "new" (stage ≥ 1). */
export function pegsLearned(srCards: SrCard[]): number {
  return srCards.filter((c) => c.stage >= 1).length;
}

/** Human "when" label for a recent-session timestamp. */
export function formatWhen(ts: number, now: number = Date.now()): string {
  const diff = differenceInCalendarDays(now, ts);
  if (diff <= 0) return `Today · ${format(ts, 'h:mmaaa')}`;
  if (diff === 1) return 'Yesterday';
  return `${diff} days ago`;
}

export { srOffset };
