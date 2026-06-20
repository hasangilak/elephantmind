/**
 * Spaced repetition ("Rule of Five") — pure logic ported from the Elephantam design.
 *
 * Stages 0..5. A card is "due" when due <= currentDay and stage < 5.
 * On a correct review: stage advances (capped at 5) and next due jumps by the
 * stage offset. On a miss: stage floors at 1 and the card returns the next day.
 */

export interface SrCard {
  /** The number this image encodes, e.g. "07". */
  n: string;
  stage: number;
  /** Day index on which this card next becomes due. */
  due: number;
}

/** Rule-of-Five offsets by stage: now, +1d, +1wk, +1mo, +3mo, mastered. */
export const SR_OFFSETS = [0, 1, 7, 30, 90, 9999] as const;

export const SR_LABELS = ['Now', '+1 day', '+1 week', '+1 month', '+3 months'] as const;

export function srOffset(stage: number): number {
  return SR_OFFSETS[stage] ?? 9999;
}

/** IDs (numbers) of all cards currently due. */
export function dueIds(cards: SrCard[], day: number): string[] {
  return cards.filter((c) => c.due <= day && c.stage < 5).map((c) => c.n);
}

export function dueCards(cards: SrCard[], day: number): SrCard[] {
  return cards.filter((c) => c.due <= day && c.stage < 5);
}

/**
 * Apply a review answer to a single card, returning the updated card.
 * Mirrors the design's srAnswer transition exactly.
 */
export function reviewCard(card: SrCard, day: number, gotIt: boolean): SrCard {
  if (gotIt) {
    const stage = Math.min(card.stage + 1, 5);
    return { ...card, stage, due: day + srOffset(stage) };
  }
  const stage = Math.max(1, card.stage);
  return { ...card, stage, due: day + 1 };
}

/** Count of cards in each stage 0..5 (design: counts). */
export function stageCounts(cards: SrCard[]): number[] {
  const counts = [0, 0, 0, 0, 0, 0];
  cards.forEach((c) => {
    counts[c.stage] = (counts[c.stage] ?? 0) + 1;
  });
  return counts;
}
