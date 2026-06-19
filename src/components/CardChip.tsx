/**
 * A playing-card face (rank + suit) on a white tile.
 */
import React from 'react';
import { View } from 'react-native';

import { T } from '@/components/ui';
import type { CardDef } from '@/data/cards';
import { colors, radii } from '@/theme/tokens';

type Size = 'sm' | 'md' | 'lg';

const DIMS: Record<Size, { w: number; h: number; r: number; rank: number; sym: number }> = {
  sm: { w: 40, h: 54, r: radii.sm, rank: 14, sym: 12 },
  md: { w: 50, h: 68, r: radii.md, rank: 17, sym: 15 },
  lg: { w: 62, h: 84, r: radii.lg, rank: 22, sym: 19 },
};

export function CardChip({ card, size = 'md', selected }: { card: CardDef; size?: Size; selected?: boolean }) {
  const d = DIMS[size];
  const c = card.color === 'red' ? colors.err : colors.ink;
  return (
    <View
      style={{
        width: d.w,
        height: d.h,
        borderRadius: d.r,
        backgroundColor: '#fff',
        borderWidth: selected ? 1.5 : 1,
        borderColor: selected ? colors.accent : colors.line,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <T w={700} s={d.rank} c={c}>
        {card.rank}
      </T>
      <T s={d.sym} c={c}>
        {card.sym}
      </T>
    </View>
  );
}
