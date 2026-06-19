/**
 * Numbers discipline — pure logic ported from the Mnemos design (DCLogic).
 * No React Native imports so it can be unit-tested directly.
 */

/** Random string of `n` decimal digits (design: genDigits). */
export function genDigits(n: number): string {
  let s = '';
  for (let i = 0; i < n; i++) s += Math.floor(Math.random() * 10);
  return s;
}

/** Split a string into 2-char chunks (design: chunk2). */
export function chunk2(str: string): string[] {
  const a: string[] = [];
  for (let i = 0; i < str.length; i += 2) a.push(str.slice(i, i + 2));
  return a;
}

/** Format seconds as m:ss (design: fmtTime). */
export function fmtTime(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s < 10 ? '0' : ''}${s}`;
}

export interface NumbersScore {
  /** Longest correct prefix — "digits correct in a row" (design: lead). */
  lead: number;
  /** Count of positionally-correct digits (design: tot). */
  correct: number;
  total: number;
  /** Percent, rounded (design: acc). */
  accuracy: number;
  /** XP gained = lead * 10 (design: xpGain). */
  xpGain: number;
}

export function scoreNumbers(target: string, input: string): NumbersScore {
  const total = target.length;
  let lead = 0;
  for (let i = 0; i < total; i++) {
    if (input[i] === target[i]) lead++;
    else break;
  }
  let correct = 0;
  for (let i = 0; i < total; i++) if (input[i] === target[i]) correct++;
  const accuracy = total ? Math.round((correct / total) * 100) : 0;
  return { lead, correct, total, accuracy, xpGain: lead * 10 };
}

/** Benchmark placement label from the lead score (design: benchPlace). */
export function benchPlace(lead: number): string {
  if (lead >= 100) return 'Advanced';
  if (lead >= 40) return 'Intermediate';
  if (lead >= 20) return 'Beginner';
  return 'Keep going';
}

export interface ScorePair {
  target: string;
  typed: string;
  ok: boolean;
}

/** Per-2-digit comparison rows for the score screen (design: scorePairs). */
export function scorePairs(target: string, input: string): ScorePair[] {
  return chunk2(target).map((p, i) => {
    const typed = (input.slice(i * 2, i * 2 + 2) || '··').padEnd(2, '·');
    const ok = input[i * 2] === p[0] && input[i * 2 + 1] === p[1];
    return { target: p, typed, ok };
  });
}
