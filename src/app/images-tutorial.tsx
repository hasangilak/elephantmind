import { useRouter } from 'expo-router';
import React from 'react';
import { View } from 'react-native';
import Animated from 'react-native-reanimated';

import { Check } from '@/components/Icon';
import { ChainRail, NarrationStage, TutorialCtas, TutorialScaffold, type ChainItem } from '@/components/Tutorial';
import { T, useEntering } from '@/components/ui';
import { colors, radii } from '@/theme/tokens';

/* Worked sample: four images linked into one absurd, moving story. */
const SAMPLE = [
  { emoji: '🔑', name: 'Key', scene: 'A giant KEY rattles in midair, turns — and unlocks the snapping jaws of a fox.' },
  { emoji: '🦊', name: 'Fox', scene: 'The FOX springs out and straps a roaring rocket to its bushy tail.' },
  { emoji: '🚀', name: 'Rocket', scene: 'The ROCKET blasts off and slams straight into a moon-sized wheel of cheese.' },
  { emoji: '🧀', name: 'Cheese', scene: 'The CHEESE bursts into gooey, stinking chunks — and the movie ends.' },
];

const SLOW = 7200;
const DEMO = 6000;

type Beat =
  | { kind: 'intro' | 'teach' | 'chain' | 'done'; title: string; body: string; dur: number }
  | { kind: 'link' | 'recall'; i: number; dur: number };

const BEATS: Beat[] = [
  { kind: 'intro', title: 'A wall of random images', body: "You'll see images in order, then have to put them back. Stared at as a plain list, they blur together in seconds.", dur: SLOW },
  { kind: 'teach', title: 'Link them into one story', body: 'Tie each image to the next with action and motion. Absurd and moving beats neat and still — your brain keeps stories, not lists.', dur: SLOW },
  { kind: 'link', i: 0, dur: DEMO },
  { kind: 'link', i: 1, dur: DEMO },
  { kind: 'link', i: 2, dur: DEMO },
  { kind: 'link', i: 3, dur: DEMO },
  { kind: 'chain', title: 'Now replay the movie', body: 'Run the little film from the very start — each scene drags in the next image, and the order comes back on its own.', dur: SLOW },
  { kind: 'recall', i: 0, dur: DEMO },
  { kind: 'recall', i: 1, dur: DEMO },
  { kind: 'recall', i: 2, dur: DEMO },
  { kind: 'recall', i: 3, dur: DEMO },
  { kind: 'done', title: 'Four images, perfect order', body: "That's the Link method. The sillier and more physical the story, the longer the chain holds — even at twenty images.", dur: 0 },
];

function railState(step: number) {
  const filled = SAMPLE.map(() => false);
  let active = -1;
  for (let i = 0; i <= step && i < BEATS.length; i++) {
    const b = BEATS[i];
    if (b.kind === 'link' || b.kind === 'recall') {
      filled[b.i] = true;
      active = b.i;
    } else {
      active = -1;
    }
  }
  return { filled, active };
}

export default function ImagesTutorialScreen() {
  const router = useRouter();

  return (
    <TutorialScaffold
      title="Link / Story"
      subtitle="Chain images into a movie"
      beats={BEATS}
      onClose={() => router.back()}
      renderRail={(step) => {
        const { filled, active } = railState(step);
        const items: ChainItem[] = SAMPLE.map((s, i) => ({
          key: s.name,
          main: s.emoji,
          filled: filled[i],
          active: active === i,
          big: true,
        }));
        return <ChainRail items={items} />;
      }}
      renderStage={(beat) => {
        switch (beat.kind) {
          case 'link':
            return <LinkStage item={SAMPLE[beat.i]} pos={beat.i + 1} />;
          case 'recall':
            return <RecallStage item={SAMPLE[beat.i]} />;
          default:
            return (
              <NarrationStage title={beat.title} body={beat.body}>
                {beat.kind === 'done' && (
                  <TutorialCtas
                    primaryLabel="Try a round"
                    onPrimary={() => router.replace('/images')}
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

function LinkStage({ item, pos }: { item: (typeof SAMPLE)[number]; pos: number }) {
  const entering = useEntering();
  return (
    <Animated.View entering={entering} style={{ backgroundColor: colors.ink, borderRadius: radii.xxl, padding: 26, alignItems: 'center' }}>
      <T s={11} w={700} ls={1} c="rgba(251,249,244,0.55)">
        SCENE {pos} OF {SAMPLE.length}
      </T>
      <T s={56} style={{ marginVertical: 8 }}>
        {item.emoji}
      </T>
      <T s={13.5} c="rgba(251,249,244,0.62)" style={{ textAlign: 'center', lineHeight: 21 }}>
        {item.scene}
      </T>
    </Animated.View>
  );
}

function RecallStage({ item }: { item: (typeof SAMPLE)[number] }) {
  const entering = useEntering();
  return (
    <Animated.View entering={entering} style={{ backgroundColor: colors.accentSoft, borderRadius: radii.xxl, padding: 26, alignItems: 'center' }}>
      <T s={12} w={700} ls={0.8} c={colors.accentDeep}>
        …the story hands you
      </T>
      <T s={56} style={{ marginVertical: 8 }}>
        {item.emoji}
      </T>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <Check size={20} color={colors.accent} strokeWidth={2.6} />
        <T s={28} w={800} ls={-0.4} c={colors.accentDeep}>
          {item.name}
        </T>
      </View>
    </Animated.View>
  );
}
