/**
 * Static game content (levels, palace, roadmap, upgrade path).
 */

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
    title: 'Names & Faces',
    body: 'A face-name link layer — recall the name under each reordered portrait.',
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

/** Distinct, vivid emoji used as the "images" in the Link/Story discipline. */
export const IMAGE_POOL = [
  '🦊', '🚀', '🍎', '🎸', '🐙', '🌵', '🧲', '🪀', '⚓', '🧀',
  '🦉', '🪐', '🧭', '🔔', '🐉', '🍄', '🎺', '🦷', '🪂', '🧦',
  '🦞', '🌋', '🪓', '🧊', '🚜', '🦩', '🎈', '🧱', '🪤', '🦓',
  '🍔', '🪕', '🐌', '🧪', '🦄', '🌂', '🛼', '🪣', '🔑', '🕯️',
];

export interface ImagesLevel {
  id: 'beginner' | 'intermediate' | 'advanced';
  label: string;
  count: number;
  time: number;
  sub: string;
}

export const IMAGES_LEVELS: Record<ImagesLevel['id'], ImagesLevel> = {
  beginner: { id: 'beginner', label: 'Beginner', count: 6, time: 30, sub: '6 images · 30s' },
  intermediate: { id: 'intermediate', label: 'Intermediate', count: 12, time: 45, sub: '12 images · 45s' },
  advanced: { id: 'advanced', label: 'Advanced', count: 18, time: 45, sub: '18 images · 45s' },
};

export const IMAGES_LEVEL_ORDER: ImagesLevel['id'][] = ['beginner', 'intermediate', 'advanced'];
