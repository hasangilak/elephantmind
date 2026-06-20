import { useRouter } from 'expo-router';
import React from 'react';
import { View } from 'react-native';
import Animated from 'react-native-reanimated';

import { Check } from '@/components/Icon';
import { NarrationStage, TutorialCtas, TutorialScaffold } from '@/components/Tutorial';
import { T, useEntering } from '@/components/ui';
import { colors, radii } from '@/theme/tokens';

/* The worked sample: a tiny 4-room palace with vivid scenes. */
const ROOMS = [
  { name: 'Front door', word: 'Banana', emoji: '🍌', scene: 'A giant banana is jammed across the front door — you snap it in half to squeeze inside.' },
  { name: 'Kitchen sink', word: 'Tiger', emoji: '🐯', scene: 'A soaking-wet tiger is doing the dishes at the sink, flinging suds everywhere.' },
  { name: 'Sofa', word: 'Balloon', emoji: '🎈', scene: 'The sofa is buried under a hundred red balloons that squeak as you flop down.' },
  { name: 'Bed', word: 'Candle', emoji: '🕯️', scene: 'A candle as thick as a tree trunk burns on your bed, dripping wax on the pillow.' },
];

const SLOW = 6800;
const DEMO = 5400;

type Beat =
  | { kind: 'intro' | 'route' | 'transition' | 'done'; title: string; body: string; dur: number }
  | { kind: 'place' | 'recall'; room: number; dur: number };

const BEATS: Beat[] = [
  { kind: 'intro', title: 'The Memory Palace', body: 'Your memory is terrible at lists — but brilliant at places. So you hide things in a place you know well, then walk back to collect them.', dur: SLOW },
  { kind: 'route', title: 'Pick a route you know', body: 'Here are four spots in a home, always visited in the same order. That route is your palace.', dur: SLOW },
  { kind: 'place', room: 0, dur: DEMO },
  { kind: 'place', room: 1, dur: DEMO },
  { kind: 'place', room: 2, dur: DEMO },
  { kind: 'place', room: 3, dur: DEMO },
  { kind: 'transition', title: 'Now empty your mind', body: 'Forget the four words. Just walk the route again — each room hands its scene back to you.', dur: SLOW },
  { kind: 'recall', room: 0, dur: DEMO },
  { kind: 'recall', room: 1, dur: DEMO },
  { kind: 'recall', room: 2, dur: DEMO },
  { kind: 'recall', room: 3, dur: DEMO },
  { kind: 'done', title: 'That’s the whole trick', body: 'Four absurd scenes, recalled in order. The wilder the picture, the better it sticks. Now build a palace from a place you know.', dur: 0 },
];

/** Replay beats up to `step` to know which room words are visible + which is active. */
function railState(step: number) {
  const revealed = new Array(ROOMS.length).fill(false);
  let active = -1;
  for (let i = 0; i <= step && i < BEATS.length; i++) {
    const b = BEATS[i];
    if (b.kind === 'place' || b.kind === 'recall') {
      revealed[b.room] = true;
      active = b.room;
    } else if (b.kind === 'transition') {
      revealed.fill(false);
      active = -1;
    } else if (b.kind === 'done') {
      revealed.fill(true);
      active = -1;
    } else {
      active = -1;
    }
  }
  return { revealed, active };
}

export default function PalaceTutorialScreen() {
  const router = useRouter();

  return (
    <TutorialScaffold
      title="How a palace works"
      subtitle="Watch, then build your own"
      beats={BEATS}
      onClose={() => router.back()}
      renderRail={(step) => {
        const { revealed, active } = railState(step);
        return (
          <View style={{ gap: 7 }}>
            {ROOMS.map((r, i) => (
              <RoomRow key={r.name} room={r} index={i} active={active === i} revealed={revealed[i]} />
            ))}
          </View>
        );
      }}
      renderStage={(beat) => {
        switch (beat.kind) {
          case 'place':
            return <PlaceStage room={ROOMS[beat.room]} />;
          case 'recall':
            return <RecallStage room={ROOMS[beat.room]} />;
          default:
            return (
              <NarrationStage title={beat.title} body={beat.body}>
                {beat.kind === 'done' && (
                  <TutorialCtas
                    primaryLabel="Build my palace"
                    onPrimary={() => router.replace('/palace')}
                    secondaryLabel="Edit my rooms"
                    onSecondary={() => router.replace('/palaces')}
                  />
                )}
              </NarrationStage>
            );
        }
      }}
    />
  );
}

function RoomRow({ room, index, active, revealed }: { room: (typeof ROOMS)[number]; index: number; active: boolean; revealed: boolean }) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 11,
        paddingVertical: 8,
        paddingHorizontal: 10,
        borderRadius: radii.md,
        backgroundColor: active ? colors.accentSoft : colors.card,
        borderWidth: 1,
        borderColor: active ? colors.accent : colors.line,
      }}
    >
      <View style={{ width: 22, height: 22, borderRadius: 7, backgroundColor: active ? colors.accent : colors.card2, alignItems: 'center', justifyContent: 'center' }}>
        <T mono w={700} s={11} c={active ? '#fff' : colors.ink3}>
          {index + 1}
        </T>
      </View>
      <T s={14} w={600} c={colors.ink} style={{ flex: 1 }}>
        {room.name}
      </T>
      {revealed ? (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: colors.card2, borderRadius: radii.sm, paddingVertical: 3, paddingHorizontal: 8 }}>
          <T s={14}>{room.emoji}</T>
          <T s={12.5} w={700} c={colors.accentDeep}>
            {room.word}
          </T>
        </View>
      ) : (
        <T s={12} c={colors.ink3}>
          —
        </T>
      )}
    </View>
  );
}

function PlaceStage({ room }: { room: (typeof ROOMS)[number] }) {
  const entering = useEntering();
  return (
    <Animated.View entering={entering} style={{ backgroundColor: colors.ink, borderRadius: radii.xxl, padding: 26, alignItems: 'center' }}>
      <T s={11} w={700} ls={1} c="rgba(251,249,244,0.55)">
        PLACE AT · {room.name.toUpperCase()}
      </T>
      <T s={56} style={{ marginVertical: 8 }}>
        {room.emoji}
      </T>
      <T s={30} w={800} ls={-0.5} c={colors.onInk} style={{ marginBottom: 10 }}>
        {room.word}
      </T>
      <T s={13.5} c="rgba(251,249,244,0.6)" style={{ textAlign: 'center', lineHeight: 20 }}>
        {room.scene}
      </T>
    </Animated.View>
  );
}

function RecallStage({ room }: { room: (typeof ROOMS)[number] }) {
  const entering = useEntering();
  return (
    <Animated.View entering={entering} style={{ backgroundColor: colors.accentSoft, borderRadius: radii.xxl, padding: 26, alignItems: 'center' }}>
      <T s={12} w={700} ls={0.8} c={colors.accentDeep}>
        You walk to the {room.name.toLowerCase()}…
      </T>
      <T s={56} style={{ marginVertical: 8 }}>
        {room.emoji}
      </T>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <Check size={20} color={colors.accent} strokeWidth={2.6} />
        <T s={30} w={800} ls={-0.5} c={colors.accentDeep}>
          {room.word}
        </T>
      </View>
    </Animated.View>
  );
}
