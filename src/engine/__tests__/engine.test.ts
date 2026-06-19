import { describe, expect, test } from '@jest/globals';

import { genDigits, chunk2, fmtTime, scoreNumbers, benchPlace, scorePairs } from '@/engine/digits';
import { scorePalace, wordMatches } from '@/engine/palace';
import { dueIds, reviewCard, srOffset, stageCounts, type SrCard } from '@/engine/sr';
import { levelForXp, xpInto, xpPct, rankForLevel, greetingFor } from '@/engine/leveling';
import { PEGS, pegByN } from '@/data/majorSystem';

describe('digits', () => {
  test('genDigits length and charset', () => {
    const d = genDigits(40);
    expect(d).toHaveLength(40);
    expect(/^[0-9]+$/.test(d)).toBe(true);
  });

  test('chunk2 splits into pairs', () => {
    expect(chunk2('12345')).toEqual(['12', '34', '5']);
    expect(chunk2('')).toEqual([]);
  });

  test('fmtTime', () => {
    expect(fmtTime(0)).toBe('0:00');
    expect(fmtTime(9)).toBe('0:09');
    expect(fmtTime(75)).toBe('1:15');
  });

  test('scoreNumbers: longest correct prefix, accuracy, xp', () => {
    // target 1234, input 1264 → lead 2 (12 then 6≠3), correct positions = 1,2,4 = 3
    const r = scoreNumbers('1234', '1264');
    expect(r.lead).toBe(2);
    expect(r.correct).toBe(3);
    expect(r.total).toBe(4);
    expect(r.accuracy).toBe(75);
    expect(r.xpGain).toBe(20);
  });

  test('scoreNumbers: perfect run', () => {
    const r = scoreNumbers('07421386', '07421386');
    expect(r.lead).toBe(8);
    expect(r.xpGain).toBe(80);
    expect(r.accuracy).toBe(100);
  });

  test('benchPlace thresholds', () => {
    expect(benchPlace(5)).toBe('Keep going');
    expect(benchPlace(20)).toBe('Beginner');
    expect(benchPlace(40)).toBe('Intermediate');
    expect(benchPlace(100)).toBe('Advanced');
  });

  test('scorePairs pads short input with dots and flags correctness', () => {
    const pairs = scorePairs('1234', '12');
    expect(pairs).toHaveLength(2);
    expect(pairs[0]).toEqual({ target: '12', typed: '12', ok: true });
    expect(pairs[1]).toEqual({ target: '34', typed: '··', ok: false });
  });
});

describe('palace', () => {
  test('wordMatches is case/space-insensitive', () => {
    expect(wordMatches('  Anchor ', 'anchor')).toBe(true);
    expect(wordMatches('cactus', 'Anchor')).toBe(false);
  });

  test('scorePalace counts correct and awards 12 xp each', () => {
    const words = ['Anchor', 'Cactus', 'Velvet'];
    const recall = { 0: 'anchor', 1: 'wrong', 2: 'Velvet' };
    const r = scorePalace(words, recall);
    expect(r.correct).toBe(2);
    expect(r.total).toBe(3);
    expect(r.xpGain).toBe(24);
  });
});

describe('spaced repetition (Rule of Five)', () => {
  test('srOffset matches the rule of five', () => {
    expect([0, 1, 2, 3, 4, 5].map(srOffset)).toEqual([0, 1, 7, 30, 90, 9999]);
  });

  test('dueIds: due when due<=day and stage<5', () => {
    const cards: SrCard[] = [
      { n: '01', stage: 0, due: 0 },
      { n: '02', stage: 2, due: 10 },
      { n: '03', stage: 5, due: 0 }, // mastered, never due
    ];
    expect(dueIds(cards, 0)).toEqual(['01']);
    expect(dueIds(cards, 10)).toEqual(['01', '02']);
  });

  test('reviewCard: got it advances stage and pushes due by offset', () => {
    const c: SrCard = { n: '07', stage: 1, due: 0 };
    const next = reviewCard(c, 3, true);
    expect(next.stage).toBe(2);
    expect(next.due).toBe(3 + 7);
  });

  test('reviewCard: miss floors stage at 1 and returns tomorrow', () => {
    expect(reviewCard({ n: '07', stage: 0, due: 0 }, 5, false)).toEqual({ n: '07', stage: 1, due: 6 });
    expect(reviewCard({ n: '07', stage: 3, due: 0 }, 5, false)).toEqual({ n: '07', stage: 3, due: 6 });
  });

  test('stageCounts buckets by stage', () => {
    const cards: SrCard[] = [
      { n: 'a', stage: 0, due: 0 },
      { n: 'b', stage: 0, due: 0 },
      { n: 'c', stage: 5, due: 0 },
    ];
    expect(stageCounts(cards)).toEqual([2, 0, 0, 0, 0, 1]);
  });
});

describe('leveling', () => {
  test('level / xpInto / xpPct', () => {
    expect(levelForXp(0)).toBe(1);
    expect(levelForXp(1240)).toBe(4);
    expect(xpInto(1240)).toBe(40);
    expect(xpPct(1240)).toBe(10);
  });

  test('rankForLevel clamps to the last rank', () => {
    expect(rankForLevel(1)).toBe('Novice');
    expect(rankForLevel(4)).toBe('Mnemonist');
    expect(rankForLevel(99)).toBe('Grandmaster');
  });

  test('greetingFor by hour', () => {
    expect(greetingFor(new Date(2026, 0, 1, 9))).toBe('Good morning');
    expect(greetingFor(new Date(2026, 0, 1, 14))).toBe('Good afternoon');
    expect(greetingFor(new Date(2026, 0, 1, 21))).toBe('Good evening');
  });
});

describe('major system data', () => {
  test('exactly 100 pegs, 00–99, unique', () => {
    expect(PEGS).toHaveLength(100);
    const ns = PEGS.map((p) => p.n);
    expect(new Set(ns).size).toBe(100);
    for (let i = 0; i < 100; i++) {
      const n = String(i).padStart(2, '0');
      expect(ns).toContain(n);
    }
  });

  test('design pegs preserved', () => {
    expect(pegByN('07')?.word).toBe('Sock');
    expect(pegByN('42')?.word).toBe('Rhino');
    expect(pegByN('99')?.word).toBe('Puppy');
  });
});
