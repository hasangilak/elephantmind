import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import { Pressable, ScrollView, TextInput, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ArrowRight, Padlock } from '@/components/Icon';
import { AppBar, Card, enterUp, ProgressBar, SquareButton, T } from '@/components/ui';
import { PALACE } from '@/data/content';
import { fmtTime } from '@/engine/digits';
import { scorePalace, wordMatches, type PalaceScore } from '@/engine/palace';
import { useProgress } from '@/state/store';
import { useUI } from '@/state/ui';
import { colors, radii } from '@/theme/tokens';

type Phase = 'brief' | 'memorize' | 'recallintro' | 'recall' | 'score';
const { loci, words, name } = PALACE;

export default function PalaceScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const recordPalace = useProgress((s) => s.recordPalace);
  const showToast = useUI((s) => s.showToast);

  const [phase, setPhase] = useState<Phase>('brief');
  const [index, setIndex] = useState(0);
  const [links, setLinks] = useState<Record<number, string>>({});
  const [recall, setRecall] = useState<Record<number, string>>({});
  const [elapsed, setElapsed] = useState(0);
  const [score, setScore] = useState<PalaceScore | null>(null);
  const startTs = useRef(0);

  const exit = () => router.back();
  const start = () => {
    setIndex(0);
    startTs.current = Date.now();
    setPhase('memorize');
  };
  const next = () => {
    if (index >= loci.length - 1) {
      setElapsed(Math.round((Date.now() - startTs.current) / 1000));
      setPhase('recallintro');
    } else {
      setIndex((i) => i + 1);
    }
  };
  const submit = () => {
    const sc = scorePalace([...words], recall);
    recordPalace(sc, elapsed);
    setScore(sc);
    setPhase('score');
    showToast(`+${sc.xpGain} XP earned`);
  };
  const restart = () => {
    setPhase('brief');
    setIndex(0);
    setLinks({});
    setRecall({});
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.paper, paddingTop: insets.top }}>
      <AppBar title="Memory Palace" subtitle={name} onClose={exit} />

      {phase === 'brief' && <Brief onStart={start} />}

      {phase === 'memorize' && (
        <Walk
          index={index}
          link={links[index] ?? ''}
          onSetLink={(v) => setLinks((m) => ({ ...m, [index]: v }))}
          onBack={() => setIndex((i) => Math.max(0, i - 1))}
          onNext={next}
        />
      )}

      {phase === 'recallintro' && (
        <RecallIntro elapsed={elapsed} onStart={() => setPhase('recall')} />
      )}

      {phase === 'recall' && (
        <Recall
          recall={recall}
          onInput={(i, v) => setRecall((m) => ({ ...m, [i]: v }))}
          onSubmit={submit}
        />
      )}

      {phase === 'score' && score && (
        <ScoreView score={score} recall={recall} onAgain={restart} onExit={exit} />
      )}
    </View>
  );
}

function Brief({ onStart }: { onStart: () => void }) {
  return (
    <View style={{ flex: 1, paddingHorizontal: 20, paddingBottom: 20 }}>
      <T s={24} w={800} ls={-0.5} style={{ lineHeight: 28, marginBottom: 4 }}>
        Walk a place you know.
      </T>
      <T s={13.5} c={colors.ink2} style={{ lineHeight: 20, marginBottom: 16 }}>
        You'll stash {words.length} words at {words.length} fixed spots in your apartment. Make each one a wild little scene. Then walk the route back and collect them in order.
      </T>
      <Card style={{ flex: 1, paddingHorizontal: 16, paddingVertical: 6 }}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {loci.map((l, i) => (
            <View key={l} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 9, borderBottomWidth: i < loci.length - 1 ? 1 : 0, borderBottomColor: colors.line }}>
              <View style={{ width: 24, height: 24, borderRadius: 7, backgroundColor: colors.accentSoft, alignItems: 'center', justifyContent: 'center' }}>
                <T mono w={700} s={11} c={colors.accentDeep}>
                  {i + 1}
                </T>
              </View>
              <T s={14.5} w={600}>
                {l}
              </T>
            </View>
          ))}
        </ScrollView>
      </Card>
      <Pressable onPress={onStart} style={[accentBtn, { marginTop: 16 }]}>
        <T s={16} w={700} c="#fff">
          Begin the walk
        </T>
        <ArrowRight size={17} color="#fff" strokeWidth={2.2} />
      </Pressable>
    </View>
  );
}

function Walk({
  index,
  link,
  onSetLink,
  onBack,
  onNext,
}: {
  index: number;
  link: string;
  onSetLink: (v: string) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  const loc = loci[index];
  const word = words[index];
  const pct = Math.round(((index + 1) / loci.length) * 100);
  return (
    <View style={{ flex: 1, paddingHorizontal: 20, paddingBottom: 20 }}>
      <ProgressBar pct={pct} height={6} style={{ marginBottom: 18 }} />
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 9, marginBottom: 14 }}>
        <View style={{ width: 34, height: 34, borderRadius: radii.sm, backgroundColor: colors.accentSoft, alignItems: 'center', justifyContent: 'center' }}>
          <T mono w={700} s={15} c={colors.accentDeep}>
            {index + 1}
          </T>
        </View>
        <View>
          <T s={11} w={600} ls={0.5} c={colors.ink3}>
            ROOM {index + 1} OF {loci.length}
          </T>
          <T s={17} w={700} ls={-0.2}>
            {loc}
          </T>
        </View>
      </View>
      <Animated.View key={index} entering={enterUp} style={{ flex: 1, backgroundColor: colors.ink, borderRadius: radii.xxl, padding: 28, alignItems: 'center', justifyContent: 'center' }}>
        <T s={12} w={600} ls={1} c="rgba(251,249,244,0.55)">
          PLACE THIS WORD HERE
        </T>
        <T s={44} w={800} ls={-1} c={colors.onInk} style={{ marginTop: 10, marginBottom: 4 }}>
          {word}
        </T>
        <T s={13} c="rgba(251,249,244,0.5)" style={{ textAlign: 'center', lineHeight: 19, maxWidth: 230 }}>
          Picture it interacting with the {loc.toLowerCase()}. Big, absurd, moving.
        </T>
      </Animated.View>
      <TextInput
        value={link}
        onChangeText={onSetLink}
        placeholder="Your image (optional) — e.g. a rusty anchor jamming the door"
        placeholderTextColor={colors.ink3}
        style={{ marginTop: 14, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.card, borderRadius: radii.lg, paddingVertical: 13, paddingHorizontal: 15, fontSize: 13.5, color: colors.ink }}
      />
      <View style={{ flexDirection: 'row', gap: 10, marginTop: 14 }}>
        <SquareButton onPress={onBack} />
        <Pressable onPress={onNext} style={darkBtn}>
          <T s={15} w={700} c={colors.onInk}>
            {index >= loci.length - 1 ? 'Done — test recall' : 'Next room'}
          </T>
          <ArrowRight size={16} color={colors.onInk} strokeWidth={2.2} />
        </Pressable>
      </View>
    </View>
  );
}

function RecallIntro({ elapsed, onStart }: { elapsed: number; onStart: () => void }) {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 28 }}>
      <Animated.View entering={enterUp} style={{ width: 64, height: 64, borderRadius: radii.xxl, backgroundColor: colors.accentSoft, alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}>
        <Padlock size={30} color={colors.accentDeep} />
      </Animated.View>
      <T s={24} w={800} ls={-0.5} style={{ marginBottom: 8 }}>
        Now walk it back.
      </T>
      <T s={14} c={colors.ink2} style={{ textAlign: 'center', lineHeight: 21, maxWidth: 260, marginBottom: 8 }}>
        Move through the rooms in order and name what you stashed at each one.
      </T>
      <T mono s={12} c={colors.ink3} style={{ marginBottom: 24 }}>
        walk took {fmtTime(elapsed)}
      </T>
      <Pressable onPress={onStart} style={[accentBtn, { width: '100%', maxWidth: 280 }]}>
        <T s={16} w={700} c="#fff">
          Start recall
        </T>
      </Pressable>
    </View>
  );
}

function Recall({
  recall,
  onInput,
  onSubmit,
}: {
  recall: Record<number, string>;
  onInput: (i: number, v: string) => void;
  onSubmit: () => void;
}) {
  return (
    <View style={{ flex: 1, paddingHorizontal: 20, paddingBottom: 18 }}>
      <T s={13} w={600} c={colors.ink2} style={{ marginBottom: 12 }}>
        Name the word at each room, in order.
      </T>
      <ScrollView style={{ flex: 1 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: 9 }}>
        {loci.map((loc, i) => (
          <View key={loc} style={{ flexDirection: 'row', alignItems: 'center', gap: 11 }}>
            <View style={{ width: 26, height: 26, borderRadius: 8, backgroundColor: colors.card2, alignItems: 'center', justifyContent: 'center' }}>
              <T mono w={700} s={11} c={colors.ink2}>
                {i + 1}
              </T>
            </View>
            <T s={12} w={600} c={colors.ink3} style={{ width: 84, lineHeight: 14 }}>
              {loc}
            </T>
            <TextInput
              value={recall[i] ?? ''}
              onChangeText={(v) => onInput(i, v)}
              placeholder="word…"
              placeholderTextColor={colors.ink3}
              autoCapitalize="none"
              autoCorrect={false}
              style={{ flex: 1, borderWidth: 1.5, borderColor: colors.line, backgroundColor: colors.card, borderRadius: radii.md, paddingVertical: 11, paddingHorizontal: 13, fontSize: 14, color: colors.ink }}
            />
          </View>
        ))}
      </ScrollView>
      <Pressable onPress={onSubmit} style={[accentBtn, { marginTop: 14, height: 52 }]}>
        <T s={15.5} w={700} c="#fff">
          Check my recall
        </T>
      </Pressable>
    </View>
  );
}

function ScoreView({
  score,
  recall,
  onAgain,
  onExit,
}: {
  score: PalaceScore;
  recall: Record<number, string>;
  onAgain: () => void;
  onExit: () => void;
}) {
  return (
    <View style={{ flex: 1, paddingHorizontal: 20, paddingBottom: 20 }}>
      <Animated.View entering={enterUp} style={{ alignItems: 'center', marginBottom: 14 }}>
        <T s={13} w={700} ls={1} c={colors.ink3}>
          PALACE WALKED
        </T>
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', marginVertical: 6 }}>
          <T mono s={48} w={700} ls={-1} c={colors.accent} style={{ lineHeight: 50 }}>
            {score.correct}
          </T>
          <T mono s={24} c={colors.ink3} style={{ lineHeight: 34 }}>
            /{score.total}
          </T>
        </View>
        <T s={13.5} c={colors.ink2}>
          words recalled · +{score.xpGain} XP
        </T>
      </Animated.View>
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: 7 }}>
        {loci.map((loc, i) => {
          const ok = wordMatches(recall[i] ?? '', words[i]);
          const typed = (recall[i] ?? '').trim();
          return (
            <View key={loc} style={{ flexDirection: 'row', alignItems: 'center', gap: 11, paddingVertical: 9, paddingHorizontal: 12, borderRadius: radii.md, borderWidth: 1.5, borderColor: ok ? colors.accent : colors.err }}>
              <View style={{ width: 22, height: 22, borderRadius: 7, backgroundColor: colors.card2, alignItems: 'center', justifyContent: 'center' }}>
                <T mono w={700} s={10} c={colors.ink3}>
                  {i + 1}
                </T>
              </View>
              <View style={{ flex: 1, minWidth: 0 }}>
                <T s={11} c={colors.ink3}>
                  {loc}
                </T>
                <T s={15} w={700}>
                  {words[i]}
                </T>
              </View>
              <T s={12.5} c={colors.ink3} style={{ fontStyle: 'italic', maxWidth: 96, textAlign: 'right' }}>
                you: {typed || '—'}
              </T>
            </View>
          );
        })}
      </ScrollView>
      <View style={{ flexDirection: 'row', gap: 10, marginTop: 14 }}>
        <Pressable onPress={onAgain} style={[softBtn, { flex: 1 }]}>
          <T s={14.5} w={700} c={colors.ink}>
            Walk again
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
  flex: 1,
  height: 52,
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
