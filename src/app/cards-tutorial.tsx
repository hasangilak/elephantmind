import { useRouter } from 'expo-router';
import React from 'react';
import { View } from 'react-native';
import Animated from 'react-native-reanimated';

import { Check } from '@/components/Icon';
import { ChainRail, NarrationStage, TutorialCtas, TutorialScaffold, type ChainItem } from '@/components/Tutorial';
import { T, useEntering } from '@/components/ui';
import { DECK, type CardDef } from '@/data/cards';
import { colors, radii } from '@/theme/tokens';

/* Worked sample: three cards, each with its fixed image, chained into a scene. */
const SAMPLE: CardDef[] = [DECK[4], DECK[24], DECK[33]]; // 5♠ Anchor · Q♥ Crown · 8♦ Key

const SLOW = 7200;
const DEMO = 6000;

type Beat =
  | { kind: 'intro' | 'teach' | 'chain' | 'done'; title: string; body: string; dur: number }
  | { kind: 'encode' | 'recall'; i: number; dur: number };

const BEATS: Beat[] = [
  { kind: 'intro', title: 'One deck, one glance', body: 'Speed Cards shows the deck once, then shuffles it — and you rebuild the exact order. Raw, fifty-two cards are hopeless.', dur: SLOW },
  { kind: 'teach', title: 'Every card is an image', body: 'Give each card a fixed picture, locked in for good. Now you memorize vivid images, not abstract symbols.', dur: SLOW },
  { kind: 'encode', i: 0, dur: DEMO },
  { kind: 'encode', i: 1, dur: DEMO },
  { kind: 'encode', i: 2, dur: DEMO },
  { kind: 'chain', title: 'Chain them into a scene', body: 'An anchor crashes down onto a golden crown, which springs open with a key. One scene — three cards, locked in order.', dur: SLOW },
  { kind: 'recall', i: 0, dur: DEMO },
  { kind: 'recall', i: 1, dur: DEMO },
  { kind: 'recall', i: 2, dur: DEMO },
  { kind: 'done', title: 'Three cards, exact order', body: 'That is the system. Group cards three per scene — Person, Action, Object — and a whole deck becomes a short film.', dur: 0 },
];

function railState(step: number) {
  const filled = SAMPLE.map(() => false);
  let active = -1;
  for (let i = 0; i <= step && i < BEATS.length; i++) {
    const b = BEATS[i];
    if (b.kind === 'encode' || b.kind === 'recall') {
      filled[b.i] = true;
      active = b.i;
    } else {
      active = -1;
    }
  }
  return { filled, active };
}

export default function CardsTutorialScreen() {
  const router = useRouter();

  return (
    <TutorialScaffold
      title="Speed Cards · PAO"
      subtitle="Cards become a story"
      beats={BEATS}
      onClose={() => router.back()}
      renderRail={(step) => {
        const { filled, active } = railState(step);
        const items: ChainItem[] = SAMPLE.map((c, i) => ({
          key: c.label,
          main: c.label,
          sub: c.defaultWord,
          filled: filled[i],
          active: active === i,
        }));
        return <ChainRail items={items} />;
      }}
      renderStage={(beat) => {
        switch (beat.kind) {
          case 'encode':
            return <EncodeStage card={SAMPLE[beat.i]} pos={beat.i + 1} />;
          case 'recall':
            return <RecallStage card={SAMPLE[beat.i]} />;
          default:
            return (
              <NarrationStage title={beat.title} body={beat.body}>
                {beat.kind === 'done' && (
                  <TutorialCtas
                    primaryLabel="Try a round"
                    onPrimary={() => router.replace('/cards')}
                    secondaryLabel="Edit my cards"
                    onSecondary={() => router.replace('/cards-system')}
                  />
                )}
              </NarrationStage>
            );
        }
      }}
    />
  );
}

/** A playing-card face, light or dark themed. */
function CardFace({ card, dark }: { card: CardDef; dark?: boolean }) {
  const suitColor = card.color === 'red' ? colors.err : dark ? colors.ink : colors.ink;
  return (
    <View style={{ width: 84, height: 112, borderRadius: radii.lg, backgroundColor: '#fff', borderWidth: 1, borderColor: colors.line, alignItems: 'center', justifyContent: 'center' }}>
      <T mono w={700} s={15} c={suitColor} style={{ position: 'absolute', top: 8, left: 10 }}>
        {card.rank}
      </T>
      <T s={40} c={suitColor}>
        {card.sym}
      </T>
    </View>
  );
}

function EncodeStage({ card, pos }: { card: CardDef; pos: number }) {
  const entering = useEntering();
  return (
    <Animated.View entering={entering} style={{ backgroundColor: colors.ink, borderRadius: radii.xxl, padding: 24, alignItems: 'center' }}>
      <T s={11} w={700} ls={1} c="rgba(251,249,244,0.55)" style={{ marginBottom: 12 }}>
        CARD {pos} OF {SAMPLE.length}
      </T>
      <CardFace card={card} />
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 14 }}>
        <T s={15} c="rgba(251,249,244,0.5)">→</T>
        <T s={26} w={800} ls={-0.4} c={colors.onInk}>
          {card.defaultWord}
        </T>
      </View>
      <T s={12.5} c="rgba(251,249,244,0.5)" style={{ marginTop: 6 }}>
        its fixed image
      </T>
    </Animated.View>
  );
}

function RecallStage({ card }: { card: CardDef }) {
  const entering = useEntering();
  return (
    <Animated.View entering={entering} style={{ backgroundColor: colors.accentSoft, borderRadius: radii.xxl, padding: 24, alignItems: 'center' }}>
      <T s={12} w={700} ls={0.8} c={colors.accentDeep} style={{ marginBottom: 12 }}>
        The scene shows {card.defaultWord.toLowerCase()}…
      </T>
      <CardFace card={card} />
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 14 }}>
        <Check size={20} color={colors.accent} strokeWidth={2.6} />
        <T s={26} w={800} ls={-0.4} c={colors.accentDeep}>
          {card.label}
        </T>
      </View>
    </Animated.View>
  );
}
