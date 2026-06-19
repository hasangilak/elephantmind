/**
 * Memory Palace discipline — pure scoring logic ported from the Mnemos design.
 */

/** Case-insensitive, trimmed match of a recalled word against the target. */
export function wordMatches(recalled: string, target: string): boolean {
  return (recalled || '').trim().toLowerCase() === target.toLowerCase();
}

export interface PalaceScore {
  correct: number;
  total: number;
  /** XP gained = correct * 12 (design: paSubmit). */
  xpGain: number;
}

/**
 * Score a palace walk. `recall` is keyed by locus index → typed word.
 */
export function scorePalace(words: string[], recall: Record<number, string>): PalaceScore {
  let correct = 0;
  words.forEach((w, i) => {
    if (wordMatches(recall[i] ?? '', w)) correct++;
  });
  return { correct, total: words.length, xpGain: correct * 12 };
}
