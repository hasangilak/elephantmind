import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Pressable, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ArrowRight, Check, ChevronLeft, ChevronRight, Play } from '@/components/Icon';
import { AppBar, ProgressBar, T, useEntering } from '@/components/ui';
import { colors, radii } from '@/theme/tokens';

/* The worked sample: a tiny 4-room palace with vivid scenes. */
const ROOMS = [
  { name: 'Front door', word: 'Banana', emoji: '🍌', scene: 'A giant banana is jammed across the front door — you snap it in half to squeeze inside.' },
  { name: 'Kitchen sink', word: 'Tiger', emoji: '🐯', scene: 'A soaking-wet tiger is doing the dishes at the sink, flinging suds everywhere.' },
  { name: 'Sofa', word: 'Balloon', emoji: '🎈', scene: 'The sofa is buried under a hundred red balloons that squeak as you flop down.' },
  { name: 'Bed', word: 'Candle', emoji: '🕯️', scene: 'A candle as thick as a tree trunk burns on your bed, dripping wax on the pillow.' },
];

type Beat =
  | { kind: 'intro' | 'route' | 'transition' | 'done'; title: string; body: string }
  | { kind: 'place' | 'recall'; room: number };

const BEATS: Beat[] = [
  { kind: 'intro', title: 'The Memory Palace', body: 'Your memory is terrible at lists — but brilliant at places. So you hide things in a place you know well, then walk back to collect them.' },
  { kind: 'route', title: 'Pick a route you know', body: 'Here are four spots in a home, always visited in the same order. That route is your palace.' },
  { kind: 'place', room: 0 },
  { kind: 'place', room: 1 },
  { kind: 'place', room: 2 },
  { kind: 'place', room: 3 },
  { kind: 'transition', title: 'Now empty your mind', body: 'Forget the four words. Just walk the route again — each room hands its scene back to you.' },
  { kind: 'recall', room: 0 },
  { kind: 'recall', room: 1 },
  { kind: 'recall', room: 2 },
  { kind: 'recall', room: 3 },
  { kind: 'done', title: 'That’s the whole trick', body: 'Four absurd scenes, recalled in order. The wilder the picture, the better it sticks. Now build a palace from a place you know.' },
];

const LAST = BEATS.length - 1;

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
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(true);
  const beat = BEATS[step];

  // Auto-advance while playing (stops at the final beat).
  useEffect(() => {
    if (!playing || step >= LAST) return;
    const slow = beat.kind === 'intro' || beat.kind === 'route' || beat.kind === 'transition';
    const id = setTimeout(() => setStep((s) => Math.min(s + 1, LAST)), slow ? 3200 : 2700);
    return () => clearTimeout(id);
  }, [step, playing, beat.kind]);

  const atEnd = step >= LAST;
  const { revealed, active } = railState(step);

  const back = () => setStep((s) => Math.max(0, s - 1));
  const fwd = () => setStep((s) => Math.min(LAST, s + 1));
  const toggle = () => {
    if (atEnd) {
      setStep(0);
      setPlaying(true);
    } else {
      setPlaying((p) => !p);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.paper, paddingTop: insets.top }}>
      <AppBar title="How a palace works" subtitle="Watch, then build your own" onClose={() => router.back()} />

      <View style={{ flex: 1, paddingHorizontal: 20, paddingBottom: 18 }}>
        {/* the route rail */}
        <View style={{ gap: 7, marginBottom: 16 }}>
          {ROOMS.map((r, i) => (
            <RoomRow key={r.name} room={r} index={i} active={active === i} revealed={revealed[i]} />
          ))}
        </View>

        {/* the animated stage */}
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <Stage beat={beat} step={step} onBuild={() => router.replace('/palace')} onManage={() => router.replace('/palaces')} />
        </View>

        {/* progress + controls */}
        <ProgressBar pct={Math.round(((step + 1) / BEATS.length) * 100)} height={6} style={{ marginBottom: 14 }} />
        {!atEnd && (
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 14 }}>
            <CircleBtn onPress={back} disabled={step === 0}>
              <ChevronLeft size={20} color={step === 0 ? colors.ink3 : colors.ink2} />
            </CircleBtn>
            <Pressable onPress={toggle} style={{ width: 60, height: 60, borderRadius: 30, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' }}>
              {playing ? <PauseGlyph /> : <Play size={22} color="#fff" />}
            </Pressable>
            <CircleBtn onPress={fwd}>
              <ChevronRight size={20} color={colors.ink2} />
            </CircleBtn>
          </View>
        )}
      </View>
    </View>
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

function Stage({ beat, step, onBuild, onManage }: { beat: Beat; step: number; onBuild: () => void; onManage: () => void }) {
  const entering = useEntering();

  if (beat.kind === 'place') {
    const r = ROOMS[beat.room];
    return (
      <Animated.View key={step} entering={entering} style={{ backgroundColor: colors.ink, borderRadius: radii.xxl, padding: 26, alignItems: 'center' }}>
        <T s={11} w={700} ls={1} c="rgba(251,249,244,0.55)">
          PLACE AT · {r.name.toUpperCase()}
        </T>
        <T s={56} style={{ marginVertical: 8 }}>
          {r.emoji}
        </T>
        <T s={30} w={800} ls={-0.5} c={colors.onInk} style={{ marginBottom: 10 }}>
          {r.word}
        </T>
        <T s={13.5} c="rgba(251,249,244,0.6)" style={{ textAlign: 'center', lineHeight: 20 }}>
          {r.scene}
        </T>
      </Animated.View>
    );
  }

  if (beat.kind === 'recall') {
    const r = ROOMS[beat.room];
    return (
      <Animated.View key={step} entering={entering} style={{ backgroundColor: colors.accentSoft, borderRadius: radii.xxl, padding: 26, alignItems: 'center' }}>
        <T s={12} w={700} ls={0.8} c={colors.accentDeep}>
          You walk to the {r.name.toLowerCase()}…
        </T>
        <T s={56} style={{ marginVertical: 8 }}>
          {r.emoji}
        </T>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Check size={20} color={colors.accent} strokeWidth={2.6} />
          <T s={30} w={800} ls={-0.5} c={colors.accentDeep}>
            {r.word}
          </T>
        </View>
      </Animated.View>
    );
  }

  // intro / route / transition / done — narration card
  const b = beat as Extract<Beat, { title: string }>;
  return (
    <Animated.View key={step} entering={entering} style={{ alignItems: 'center', paddingHorizontal: 6 }}>
      <T s={26} w={800} ls={-0.6} c={colors.ink} style={{ textAlign: 'center', marginBottom: 12 }}>
        {b.title}
      </T>
      <T s={15} c={colors.ink2} style={{ textAlign: 'center', lineHeight: 23, maxWidth: 320 }}>
        {b.body}
      </T>
      {beat.kind === 'done' && (
        <View style={{ alignSelf: 'stretch', gap: 10, marginTop: 22 }}>
          <Pressable onPress={onBuild} style={{ height: 54, borderRadius: radii.xl, backgroundColor: colors.accent, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9 }}>
            <T s={16} w={700} c="#fff">
              Build my palace
            </T>
            <ArrowRight size={17} color="#fff" strokeWidth={2.2} />
          </Pressable>
          <Pressable onPress={onManage} style={{ height: 50, borderRadius: radii.lg, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line, alignItems: 'center', justifyContent: 'center' }}>
            <T s={14.5} w={700} c={colors.ink}>
              Edit my rooms
            </T>
          </Pressable>
        </View>
      )}
    </Animated.View>
  );
}

function CircleBtn({ onPress, disabled, children }: { onPress: () => void; disabled?: boolean; children: React.ReactNode }) {
  return (
    <Pressable onPress={disabled ? undefined : onPress} style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line, alignItems: 'center', justifyContent: 'center', opacity: disabled ? 0.5 : 1 }}>
      {children}
    </Pressable>
  );
}

function PauseGlyph() {
  return (
    <View style={{ flexDirection: 'row', gap: 5 }}>
      <View style={{ width: 5, height: 20, borderRadius: 2, backgroundColor: '#fff' }} />
      <View style={{ width: 5, height: 20, borderRadius: 2, backgroundColor: '#fff' }} />
    </View>
  );
}
