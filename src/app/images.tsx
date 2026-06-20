import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Play, Timer } from '@/components/Icon';
import { DemoBanner } from '@/components/Tutorial';
import { AppBar, Card, CountUp, T, useEntering } from '@/components/ui';
import { IMAGES_LEVELS, IMAGES_LEVEL_ORDER, IMAGE_POOL, type ImagesLevel } from '@/data/content';
import { fmtTime } from '@/engine/digits';
import { pickImages, scoreImages, shuffle, type ImageItem, type ImagesScore } from '@/engine/images';
import * as haptics from '@/lib/haptics';
import { useProgress } from '@/state/store';
import { useUI } from '@/state/ui';
import { colors, radii } from '@/theme/tokens';

type Phase = 'ready' | 'memorize' | 'recall' | 'score';

export default function ImagesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const recordImages = useProgress((s) => s.recordImages);
  const showToast = useUI((s) => s.showToast);

  const [phase, setPhase] = useState<Phase>('ready');
  const [levelId, setLevelId] = useState<ImagesLevel['id']>('beginner');
  const [sequence, setSequence] = useState<ImageItem[]>([]);
  const [recallPool, setRecallPool] = useState<ImageItem[]>([]);
  const [answer, setAnswer] = useState<ImageItem[]>([]);
  const [remaining, setRemaining] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [score, setScore] = useState<ImagesScore | null>(null);
  const startTs = useRef(0);

  const level = IMAGES_LEVELS[levelId];

  useEffect(() => {
    if (phase !== 'memorize') return;
    const id = setInterval(() => setRemaining((r) => Math.max(0, r - 1)), 1000);
    return () => clearInterval(id);
  }, [phase]);

  const goRecall = () => {
    setElapsed(Math.max(1, Math.round((Date.now() - startTs.current) / 1000)));
    setRecallPool(shuffle(sequence));
    setAnswer([]);
    setPhase('recall');
  };
  useEffect(() => {
    if (phase === 'memorize' && remaining === 0) goRecall();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remaining, phase]);

  const exit = () => router.back();

  const start = () => {
    setSequence(pickImages(IMAGE_POOL, level.count));
    setAnswer([]);
    setRemaining(level.time);
    setScore(null);
    startTs.current = Date.now();
    setPhase('memorize');
  };

  const place = (item: ImageItem) => {
    haptics.tapKey();
    setAnswer((a) => [...a, item]);
  };
  const unplace = (index: number) => {
    haptics.tapKey();
    setAnswer((a) => a.filter((_, i) => i !== index));
  };

  const submit = () => {
    const sc = scoreImages(sequence, answer);
    recordImages(sc.correct, sc.total, elapsed);
    setScore(sc);
    setPhase('score');
    if (sc.correct === sc.total) haptics.success();
    else haptics.tapMedium();
    showToast(`+${sc.xpGain} XP earned`);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.paper, paddingTop: insets.top }}>
      <AppBar title="Images" subtitle="Link / Story" onClose={exit} />
      {phase === 'ready' && (
        <Ready levelId={levelId} onPick={setLevelId} onStart={start} onLearn={() => router.push('/images-tutorial')} />
      )}
      {phase === 'memorize' && (
        <Memorize sequence={sequence} remaining={remaining} onDone={goRecall} />
      )}
      {phase === 'recall' && (
        <Recall
          pool={recallPool}
          answer={answer}
          total={sequence.length}
          onPlace={place}
          onUnplace={unplace}
          onSubmit={submit}
        />
      )}
      {phase === 'score' && score && (
        <ScoreView score={score} sequence={sequence} answer={answer} elapsed={elapsed} onAgain={() => setPhase('ready')} onExit={exit} />
      )}
    </View>
  );
}

/* ----------------------------- READY ----------------------------- */

function Ready({ levelId, onPick, onStart, onLearn }: { levelId: ImagesLevel['id']; onPick: (id: ImagesLevel['id']) => void; onStart: () => void; onLearn: () => void }) {
  return (
    <View style={{ flex: 1, paddingHorizontal: 20, paddingTop: 8, paddingBottom: 20 }}>
      <T s={24} w={800} ls={-0.5} style={{ marginBottom: 4 }}>
        Chain them into a story
      </T>
      <T s={13.5} c={colors.ink2} style={{ lineHeight: 20, marginBottom: 16 }}>
        Don't memorize a list — link each image to the next in one absurd, moving scene. Then replay the story to put them back in order.
      </T>
      <View style={{ gap: 11 }}>
        {IMAGES_LEVEL_ORDER.map((id) => {
          const l = IMAGES_LEVELS[id];
          const active = id === levelId;
          return (
            <Pressable
              key={id}
              onPress={() => onPick(id)}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 14, borderRadius: radii.xl, padding: 16, backgroundColor: active ? colors.ink : colors.card, borderWidth: 1.5, borderColor: active ? colors.ink : colors.line }}
            >
              <View style={{ flex: 1 }}>
                <T s={16.5} w={700} c={active ? colors.onInk : colors.ink}>
                  {l.label}
                </T>
                <T mono s={12} c={active ? 'rgba(251,249,244,0.6)' : colors.ink3} style={{ marginTop: 2 }}>
                  {l.sub}
                </T>
              </View>
            </Pressable>
          );
        })}
      </View>
      <View style={{ flex: 1 }} />
      <DemoBanner label="New here? Watch a worked example" onPress={onLearn} />
      <Pressable onPress={onStart} style={[accentBtn, { marginTop: 12 }]}>
        <T s={16} w={700} c="#fff">
          Start round
        </T>
        <Play size={18} color="#fff" />
      </Pressable>
    </View>
  );
}

/* ----------------------------- MEMORIZE ----------------------------- */

function Memorize({ sequence, remaining, onDone }: { sequence: ImageItem[]; remaining: number; onDone: () => void }) {
  const timerColor = remaining <= 10 ? colors.err : colors.ink;
  return (
    <View style={{ flex: 1, paddingHorizontal: 20, paddingBottom: 18 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <View>
          <T s={11} w={700} ls={1} c={colors.ink3}>
            MEMORIZE
          </T>
          <T s={13} w={600} c={colors.ink2}>
            {sequence.length} images, in order
          </T>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line, borderRadius: radii.lg, paddingVertical: 8, paddingHorizontal: 14 }}>
          <Timer size={15} color={timerColor} />
          <T mono w={700} s={18} c={timerColor}>
            {fmtTime(remaining)}
          </T>
        </View>
      </View>
      <Card style={{ flex: 1, padding: 14 }}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'center' }}>
          {sequence.map((it, i) => (
            <View key={it.id} style={{ width: 72, height: 80, borderRadius: radii.lg, backgroundColor: colors.card2, alignItems: 'center', justifyContent: 'center' }}>
              <T mono s={11} w={700} c={colors.ink3} style={{ position: 'absolute', top: 6, left: 8 }}>
                {i + 1}
              </T>
              <T s={36}>{it.char}</T>
            </View>
          ))}
        </ScrollView>
      </Card>
      <Pressable onPress={onDone} style={[darkBtn, { height: 52, marginTop: 16 }]}>
        <T s={15.5} w={700} c={colors.onInk}>
          I've got it — recall now
        </T>
      </Pressable>
    </View>
  );
}

/* ----------------------------- RECALL ----------------------------- */

function Recall({
  pool,
  answer,
  total,
  onPlace,
  onUnplace,
  onSubmit,
}: {
  pool: ImageItem[];
  answer: ImageItem[];
  total: number;
  onPlace: (it: ImageItem) => void;
  onUnplace: (index: number) => void;
  onSubmit: () => void;
}) {
  const placedIds = new Set(answer.map((a) => a.id));
  const remaining = pool.filter((it) => !placedIds.has(it.id));
  const complete = answer.length === total;
  return (
    <View style={{ flex: 1, paddingHorizontal: 20, paddingBottom: 16 }}>
      <View style={{ alignItems: 'center', marginBottom: 12 }}>
        <T s={11} w={700} ls={1} c={colors.accent}>
          RECALL
        </T>
        <T s={13} w={600} c={colors.ink2}>
          Tap the images in their original order · {answer.length}/{total}
        </T>
      </View>

      {/* answer slots */}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center', backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line, borderRadius: radii.xl, padding: 12, marginBottom: 14 }}>
        {Array.from({ length: total }).map((_, i) => {
          const it = answer[i];
          return (
            <Pressable
              key={i}
              onPress={() => it && onUnplace(i)}
              style={{ width: 50, height: 56, borderRadius: radii.md, backgroundColor: it ? colors.accentSoft : colors.card2, borderWidth: it ? 1.5 : 0, borderColor: colors.accent, alignItems: 'center', justifyContent: 'center' }}
            >
              {it ? <T s={26}>{it.char}</T> : <T mono s={13} c={colors.ink3}>{i + 1}</T>}
            </Pressable>
          );
        })}
      </View>

      <T s={11} w={700} ls={0.8} c={colors.ink3} style={{ marginBottom: 8 }}>
        TAP IN ORDER
      </T>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'center' }} style={{ flex: 1 }}>
        {remaining.map((it) => (
          <Pressable
            key={it.id}
            onPress={() => onPlace(it)}
            style={{ width: 60, height: 66, borderRadius: radii.lg, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line, alignItems: 'center', justifyContent: 'center' }}
          >
            <T s={32}>{it.char}</T>
          </Pressable>
        ))}
      </ScrollView>

      <Pressable
        onPress={complete ? onSubmit : undefined}
        style={[accentBtn, { marginTop: 12, height: 52, backgroundColor: complete ? colors.accent : colors.card2 }]}
      >
        <T s={15.5} w={700} c={complete ? '#fff' : colors.ink3}>
          {complete ? 'Check order' : `Place all ${total}`}
        </T>
      </Pressable>
    </View>
  );
}

/* ----------------------------- SCORE ----------------------------- */

function ScoreView({
  score,
  sequence,
  answer,
  elapsed,
  onAgain,
  onExit,
}: {
  score: ImagesScore;
  sequence: ImageItem[];
  answer: ImageItem[];
  elapsed: number;
  onAgain: () => void;
  onExit: () => void;
}) {
  const entering = useEntering();
  return (
    <View style={{ flex: 1, paddingHorizontal: 20, paddingBottom: 20 }}>
      <Animated.View entering={entering} style={{ alignItems: 'center', marginBottom: 14 }}>
        <T s={13} w={700} ls={1} c={colors.ink3}>
          ROUND COMPLETE
        </T>
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', marginVertical: 6 }}>
          <CountUp value={score.correct} mono s={52} w={700} ls={-1.5} c={colors.accent} style={{ lineHeight: 56 }} />
          <T mono s={26} c={colors.ink3} style={{ lineHeight: 40 }}>
            /{score.total}
          </T>
        </View>
        <T s={13.5} c={colors.ink2}>
          images in the right place
        </T>
      </Animated.View>
      <View style={{ flexDirection: 'row', gap: 10, marginBottom: 14 }}>
        <StatBox value={`${score.accuracy}%`} label="accuracy" />
        <StatBox value={fmtTime(elapsed)} label="time" />
        <StatBox value={`+${score.xpGain}`} label="XP" accent />
      </View>
      <T s={11} w={700} ls={0.8} c={colors.ink3} style={{ marginBottom: 8 }}>
        YOUR ORDER
      </T>
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} contentContainerStyle={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, alignContent: 'flex-start' }}>
        {sequence.map((orig, i) => {
          const got = answer[i];
          const ok = got?.id === orig.id;
          return (
            <View key={i} style={{ width: 54, height: 64, borderRadius: radii.md, backgroundColor: ok ? colors.accentSoft : colors.errSoft, alignItems: 'center', justifyContent: 'center' }}>
              <T s={26}>{orig.char}</T>
              <T mono s={9} c={ok ? colors.accent : colors.err} style={{ marginTop: 2 }}>
                {ok ? '✓' : got ? got.char : '—'}
              </T>
            </View>
          );
        })}
      </ScrollView>
      <View style={{ flexDirection: 'row', gap: 10, marginTop: 12 }}>
        <Pressable onPress={onAgain} style={[softBtn, { flex: 1 }]}>
          <T s={14.5} w={700} c={colors.ink}>
            Again
          </T>
        </Pressable>
        <Pressable onPress={onExit} style={[darkBtn, { flex: 1, height: 50 }]}>
          <T s={14.5} w={700} c={colors.onInk}>
            Done
          </T>
        </Pressable>
      </View>
    </View>
  );
}

function StatBox({ value, label, accent }: { value: string; label: string; accent?: boolean }) {
  return (
    <View style={{ flex: 1, backgroundColor: accent ? colors.accentSoft : colors.card, borderWidth: 1, borderColor: accent ? colors.accentSoft : colors.line, borderRadius: radii.lg, padding: 12, alignItems: 'center' }}>
      <T mono w={700} s={20} c={accent ? colors.accentDeep : colors.ink}>
        {value}
      </T>
      <T s={11} c={accent ? colors.accentDeep : colors.ink3} style={{ marginTop: 2 }}>
        {label}
      </T>
    </View>
  );
}

const accentBtn = {
  height: 54,
  borderRadius: radii.xl,
  backgroundColor: colors.accent,
  flexDirection: 'row' as const,
  alignItems: 'center' as const,
  justifyContent: 'center' as const,
  gap: 9,
};
const darkBtn = {
  borderRadius: radii.lg,
  backgroundColor: colors.ink,
  flexDirection: 'row' as const,
  alignItems: 'center' as const,
  justifyContent: 'center' as const,
  gap: 8,
};
const softBtn = {
  height: 50,
  borderRadius: radii.lg,
  backgroundColor: colors.card,
  borderWidth: 1,
  borderColor: colors.line,
  alignItems: 'center' as const,
  justifyContent: 'center' as const,
};
