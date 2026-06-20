import { useRouter } from 'expo-router';
import React from 'react';
import { View } from 'react-native';
import Animated from 'react-native-reanimated';

import { Check } from '@/components/Icon';
import { ChainRail, NarrationStage, TutorialCtas, TutorialScaffold, type ChainItem } from '@/components/Tutorial';
import { T, useEntering } from '@/components/ui';
import { DIGIT_MAP, pegByN, type Peg } from '@/data/majorSystem';
import { colors, radii } from '@/theme/tokens';

/* Worked sample: encode the number 42 07 13 into three peg images. */
const SAMPLE: Peg[] = ['42', '07', '13'].map((n) => pegByN(n)).filter((p): p is Peg => !!p);
const TARGET = SAMPLE.map((p) => p.n).join(' ');
const JOINED = SAMPLE.map((p) => p.n).join('');

const SLOW = 7200;
const DEMO = 6000;

type Beat =
  | { kind: 'intro' | 'code' | 'chain' | 'done'; title: string; body: string; dur: number }
  | { kind: 'encode' | 'recall'; i: number; dur: number };

const BEATS: Beat[] = [
  { kind: 'intro', title: 'Turn numbers into pictures', body: `Try to hold ${TARGET} in your head — in a few seconds it's gone. The Major System turns each pair of digits into a sound, then a picture that sticks.`, dur: SLOW },
  { kind: 'code', title: 'Every digit owns a sound', body: 'Two digits make two consonant sounds. The word you build from them — vowels are free — becomes your image.', dur: 8200 },
  { kind: 'encode', i: 0, dur: DEMO },
  { kind: 'encode', i: 1, dur: DEMO },
  { kind: 'encode', i: 2, dur: DEMO },
  { kind: 'chain', title: 'The Story method', body: `No palace needed — just chain the images into one running story: a charging rhino tramples a soggy sock, then flips a shiny dime. The plot locks their order.`, dur: SLOW },
  { kind: 'recall', i: 0, dur: DEMO },
  { kind: 'recall', i: 1, dur: DEMO },
  { kind: 'recall', i: 2, dur: DEMO },
  { kind: 'done', title: `You just stored ${JOINED}`, body: 'Six digits as one silly story. Chain the images into a story or drop them in a palace — both lock the order. Learn all 100 pegs and any number turns into a movie.', dur: 0 },
];

/** Which peg slots are filled (image known) and the active one, up to `step`. */
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

export default function NumbersTutorialScreen() {
  const router = useRouter();

  return (
    <TutorialScaffold
      title="The Major System"
      subtitle="Digits become images"
      beats={BEATS}
      onClose={() => router.back()}
      renderRail={(step) => {
        const { filled, active } = railState(step);
        const items: ChainItem[] = SAMPLE.map((p, i) => ({
          key: p.n,
          main: p.word,
          sub: p.n,
          filled: filled[i],
          active: active === i,
        }));
        return <ChainRail items={items} />;
      }}
      renderStage={(beat) => {
        switch (beat.kind) {
          case 'code':
            return <CodeStage />;
          case 'encode':
            return <EncodeStage peg={SAMPLE[beat.i]} pos={beat.i + 1} />;
          case 'recall':
            return <RecallStage peg={SAMPLE[beat.i]} />;
          default:
            return (
              <NarrationStage title={beat.title} body={beat.body}>
                {beat.kind === 'done' && (
                  <TutorialCtas
                    primaryLabel="Try a round"
                    onPrimary={() => router.replace('/numbers')}
                    secondaryLabel="Got it"
                    onSecondary={() => router.back()}
                  />
                )}
              </NarrationStage>
            );
        }
      }}
    />
  );
}

function CodeStage() {
  const entering = useEntering();
  return (
    <Animated.View entering={entering} style={{ backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line, borderRadius: radii.xxl, padding: 18 }}>
      <T s={11} w={700} ls={0.8} c={colors.ink3} style={{ marginBottom: 12, textAlign: 'center' }}>
        DIGIT → SOUND
      </T>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8 }}>
        {DIGIT_MAP.map(([d, sound]) => (
          <View key={d} style={{ width: '30%', flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 6 }}>
            <View style={{ width: 26, height: 26, borderRadius: 8, backgroundColor: colors.accentSoft, alignItems: 'center', justifyContent: 'center' }}>
              <T mono w={700} s={13} c={colors.accentDeep}>
                {d}
              </T>
            </View>
            <T mono s={12.5} w={700} c={colors.ink}>
              {sound}
            </T>
          </View>
        ))}
      </View>
    </Animated.View>
  );
}

function EncodeStage({ peg, pos }: { peg: Peg; pos: number }) {
  const entering = useEntering();
  return (
    <Animated.View entering={entering} style={{ backgroundColor: colors.ink, borderRadius: radii.xxl, padding: 26, alignItems: 'center' }}>
      <T s={11} w={700} ls={1} c="rgba(251,249,244,0.55)">
        PAIR {pos} OF {SAMPLE.length}
      </T>
      <T mono s={50} w={700} ls={2} c={colors.onInk} style={{ marginVertical: 6 }}>
        {peg.n}
      </T>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 }}>
        <T mono s={15} w={700} c="rgba(251,249,244,0.7)">
          {peg.sound}
        </T>
        <T s={15} c="rgba(251,249,244,0.5)">
          →
        </T>
        <T s={24} w={800} ls={-0.4} c={colors.onInk}>
          {peg.word}
        </T>
      </View>
      <T s={13.5} c="rgba(251,249,244,0.6)" style={{ textAlign: 'center', lineHeight: 20 }}>
        {peg.hint}
      </T>
    </Animated.View>
  );
}

function RecallStage({ peg }: { peg: Peg }) {
  const entering = useEntering();
  return (
    <Animated.View entering={entering} style={{ backgroundColor: colors.accentSoft, borderRadius: radii.xxl, padding: 26, alignItems: 'center' }}>
      <T s={12} w={700} ls={0.8} c={colors.accentDeep}>
        You picture…
      </T>
      <T s={26} w={800} ls={-0.4} c={colors.accentDeep} style={{ marginVertical: 8 }}>
        {peg.word}
      </T>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <Check size={20} color={colors.accent} strokeWidth={2.6} />
        <T mono s={34} w={700} ls={2} c={colors.accentDeep}>
          {peg.n}
        </T>
      </View>
    </Animated.View>
  );
}
