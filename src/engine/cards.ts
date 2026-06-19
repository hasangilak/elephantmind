/**
 * Cards discipline (Speed Cards) — pure logic.
 * Deal order A (memorize), reshuffle to a pool B, reorganize B back to A.
 */
import { DECK, type CardDef } from '@/data/cards';
import { shuffle } from '@/engine/images';

/** Deal `count` cards as the to-memorize order A. */
export function dealRound(count: number): CardDef[] {
  return shuffle(DECK).slice(0, count);
}

export interface CardsScore {
  /** Cards in the correct absolute position. */
  correct: number;
  /** Longest correct run from the start. */
  lead: number;
  total: number;
  accuracy: number;
  /** XP = correct * 4. */
  xpGain: number;
}

/** Score the reorganized `answer` against the memorized order `a`. */
export function scoreCards(a: CardDef[], answer: CardDef[]): CardsScore {
  const total = a.length;
  let correct = 0;
  let lead = 0;
  let broken = false;
  for (let i = 0; i < total; i++) {
    const ok = !!answer[i] && answer[i].id === a[i].id;
    if (ok) correct++;
    if (ok && !broken) lead++;
    else broken = true;
  }
  const accuracy = total ? Math.round((correct / total) * 100) : 0;
  return { correct, lead, total, accuracy, xpGain: correct * 4 };
}
