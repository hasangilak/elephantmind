/**
 * Standard 52-card deck + a default word/image per card for the PAO-style
 * encoding. Users can override any card's word in the Card-system editor.
 */

export type SuitKey = 'spades' | 'hearts' | 'diamonds' | 'clubs';

export interface CardDef {
  /** 0..51, stable id = suitIndex*13 + rankIndex. */
  id: number;
  rank: string;
  suit: SuitKey;
  sym: string;
  color: 'red' | 'black';
  /** e.g. "3♥", "10♠". */
  label: string;
  /** Default association word (editable per-user). */
  defaultWord: string;
}

const SUITS: { key: SuitKey; sym: string; color: 'red' | 'black' }[] = [
  { key: 'spades', sym: '♠', color: 'black' },
  { key: 'hearts', sym: '♥', color: 'red' },
  { key: 'diamonds', sym: '♦', color: 'red' },
  { key: 'clubs', sym: '♣', color: 'black' },
];

const RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

const WORDS: Record<SuitKey, string[]> = {
  spades: ['Spade', 'Axe', 'Sword', 'Shovel', 'Anchor', 'Arrow', 'Helmet', 'Hammer', 'Pickaxe', 'Dagger', 'Scythe', 'Shield', 'Raven'],
  hearts: ['Heart', 'Rose', 'Wine', 'Lips', 'Apple', 'Cherry', 'Robin', 'Flame', 'Candle', 'Ruby', 'Violin', 'Crown', 'Cupid'],
  diamonds: ['Prism', 'Coin', 'Ring', 'Crystal', 'Mirror', 'Lantern', 'Compass', 'Key', 'Gem', 'Chandelier', 'Goblet', 'Tiara', 'Scepter'],
  clubs: ['Club', 'Acorn', 'Clover', 'Mushroom', 'Oak', 'Branch', 'Walnut', 'Pinecone', 'Bamboo', 'Cactus', 'Vine', 'Fern', 'Staff'],
};

/** The full ordered deck of 52 card definitions. */
export const DECK: CardDef[] = SUITS.flatMap((s, si) =>
  RANKS.map((rank, ri) => ({
    id: si * 13 + ri,
    rank,
    suit: s.key,
    sym: s.sym,
    color: s.color,
    label: `${rank}${s.sym}`,
    defaultWord: WORDS[s.key][ri],
  })),
);

export interface CardsLevel {
  id: 'beginner' | 'intermediate' | 'advanced';
  label: string;
  count: number;
  time: number;
  sub: string;
}

export const CARDS_LEVELS: Record<CardsLevel['id'], CardsLevel> = {
  beginner: { id: 'beginner', label: 'Beginner', count: 13, time: 45, sub: '13 cards · 45s' },
  intermediate: { id: 'intermediate', label: 'Intermediate', count: 26, time: 90, sub: 'half deck · 90s' },
  advanced: { id: 'advanced', label: 'Advanced', count: 52, time: 180, sub: 'full deck · 3m' },
};

export const CARDS_LEVEL_ORDER: CardsLevel['id'][] = ['beginner', 'intermediate', 'advanced'];

/** Combo (story) sizes the user can group cards by while memorizing. */
export const COMBO_SIZES = [1, 2, 3, 4] as const;

/** Effective association word for a card: the user override, else the default. */
export function wordForCard(card: CardDef, overrides: Record<string, string>): string {
  const o = overrides[card.id];
  return o && o.trim() ? o.trim() : card.defaultWord;
}
