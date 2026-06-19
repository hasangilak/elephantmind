/**
 * Images discipline (Link/Story) — pure logic.
 * Memorize a sequence of images in order, then reproduce the order.
 */

export interface ImageItem {
  /** Stable id = the item's index in the original presented order. */
  id: number;
  char: string;
}

/** Fisher–Yates shuffle (returns a new array). */
export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Pick `n` distinct images from the pool, in a random order, ids 0..n-1. */
export function pickImages(pool: string[], n: number): ImageItem[] {
  return shuffle(pool)
    .slice(0, n)
    .map((char, i) => ({ id: i, char }));
}

export interface ImagesScore {
  correct: number;
  total: number;
  accuracy: number;
  xpGain: number;
}

/** Score by exact position match against the original order. XP = correct * 6. */
export function scoreImages(original: ImageItem[], answer: ImageItem[]): ImagesScore {
  const total = original.length;
  let correct = 0;
  for (let i = 0; i < total; i++) {
    if (answer[i]?.id === original[i].id) correct++;
  }
  const accuracy = total ? Math.round((correct / total) * 100) : 0;
  return { correct, total, accuracy, xpGain: correct * 6 };
}
