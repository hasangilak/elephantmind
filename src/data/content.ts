/**
 * Static game content ported from the Mnemos design (levels, palace, roadmap,
 * upgrade path, seed spaced-repetition deck).
 */
import type { SrCard } from '@/engine/sr';

export interface NumbersLevel {
  id: 'beginner' | 'intermediate' | 'advanced';
  label: string;
  digits: number;
  time: number;
  sub: string;
  bench: string;
}

export const LEVELS: Record<NumbersLevel['id'], NumbersLevel> = {
  beginner: {
    id: 'beginner',
    label: 'Beginner',
    digits: 20,
    time: 60,
    sub: '20 digits · 60s',
    bench: '30–60 digits / 5 min',
  },
  intermediate: {
    id: 'intermediate',
    label: 'Intermediate',
    digits: 40,
    time: 60,
    sub: '40 digits · 60s',
    bench: '100+ digits / 5 min',
  },
  advanced: {
    id: 'advanced',
    label: 'Advanced',
    digits: 60,
    time: 45,
    sub: '60 digits · 45s',
    bench: '300+ digits / 5 min',
  },
};

export const LEVEL_ORDER: NumbersLevel['id'][] = ['beginner', 'intermediate', 'advanced'];

export const PALACE = {
  name: 'Your Apartment',
  loci: [
    'Front door',
    'Coat hooks',
    'Shoe rack',
    'Hall mirror',
    'Kitchen sink',
    'Fridge',
    'Stove top',
    'Dining table',
    'Sofa',
    'TV stand',
    'Bookshelf',
    'Bedroom door',
  ],
  words: [
    'Anchor',
    'Cactus',
    'Velvet',
    'Thunder',
    'Pickle',
    'Harbor',
    'Marble',
    'Falcon',
    'Lantern',
    'Compass',
    'Walnut',
    'Cobweb',
  ],
} as const;

export interface RoadmapItem {
  tag: string;
  title: string;
  body: string;
}

export const ROADMAP_ITEMS: RoadmapItem[] = [
  {
    tag: 'DISCIPLINES',
    title: 'Cards & Names',
    body: 'Reuse your 52 number-images for a deck; add a face-name link layer for 30 portraits.',
  },
  {
    tag: 'MULTIPLAYER',
    title: 'Head-to-head',
    body: 'Memory League-style live duels — same set, fastest accurate recall wins.',
  },
  {
    tag: 'TRAINING',
    title: 'Speed metronome',
    body: 'A tempo track that forces faster encoding to push you past plateaus.',
  },
  {
    tag: 'PALACES',
    title: 'Rotation (anti-ghost)',
    body: 'Cycle palaces automatically so old images stop bleeding into new attempts.',
  },
  {
    tag: 'REVIEW',
    title: 'Error-correction replay',
    body: 'Auto-surfaces your weakest images and replays only those until they stick.',
  },
];

export type UpgradeState = 'active' | 'next' | 'locked';

export interface UpgradeStep {
  name: string;
  meta: string;
  state: UpgradeState;
}

export const UPGRADE_PATH: UpgradeStep[] = [
  { name: '2-digit system', meta: '00–99 · you are here', state: 'active' },
  { name: 'PAO', meta: 'Person–Action–Object · 3 digits/image', state: 'next' },
  { name: '2-card system', meta: 'pairs of cards as one image', state: 'locked' },
];

/** Seed SR deck — the design's 14 starter cards with their stages/dues. */
export const SEED_SR_CARDS: SrCard[] = [
  { n: '07', stage: 1, due: 0 },
  { n: '42', stage: 0, due: 0 },
  { n: '13', stage: 2, due: 0 },
  { n: '31', stage: 0, due: 0 },
  { n: '86', stage: 0, due: 0 },
  { n: '50', stage: 1, due: 0 },
  { n: '09', stage: 0, due: 0 },
  { n: '04', stage: 1, due: 0 },
  { n: '99', stage: 3, due: 2 },
  { n: '25', stage: 2, due: 6 },
  { n: '33', stage: 2, due: 5 },
  { n: '90', stage: 3, due: 20 },
  { n: '74', stage: 4, due: 40 },
  { n: '12', stage: 4, due: 85 },
];

/** Days already credited as learned, added to SR stage≥1 count (design: +24). */
export const PEGS_LEARNED_BASE = 24;
