import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ArrowDown, ArrowRight, Play, Timer } from '@/components/Icon';
import { AppBar, Card, enterUp, SquareButton, T } from '@/components/ui';
import { LEVELS, LEVEL_ORDER, type NumbersLevel } from '@/data/content';
import { DIGIT_MAP, pegByN } from '@/data/majorSystem';
import { benchPlace, chunk2, fmtTime, genDigits, scoreNumbers, scorePairs, type NumbersScore } from '@/engine/digits';
import * as haptics from '@/lib/haptics';
import { useProgress } from '@/state/store';
import { useUI } from '@/state/ui';
import { colors, radii } from '@/theme/tokens';

type Phase = 'lesson' | 'ready' | 'memorize' | 'recall' | 'score';
const LESSON_STEPS = ['map', 'glue', 'encode', 'quiz'] as const;

export default function NumbersScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const recordNumbers = useProgress((s) => s.recordNumbers);
  const showToast = useUI((s) => s.showToast);

  const [phase, setPhase] = useState<Phase>('lesson');
  const [lessonStep, setLessonStep] = useState(0);
  const [quizPick, setQuizPick] = useState<string | null>(null);
  const [quizOk, setQuizOk] = useState(false);
  const [levelId, setLevelId] = useState<NumbersLevel['id']>('beginner');
  const [digits, setDigits] = useState('');
  const [input, setInput] = useState('');
  const [remaining, setRemaining] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [hints, setHints] = useState(false);
  const [score, setScore] = useState<NumbersScore | null>(null);
  const startTs = useRef(0);

  const level = LEVELS[levelId];
  const total = digits.length;

  // countdown during memorize
  useEffect(() => {
    if (phase !== 'memorize') return;
    const id = setInterval(() => setRemaining((r) => Math.max(0, r - 1)), 1000);
    return () => clearInterval(id);
  }, [phase]);

  const goRecall = () => {
    setElapsed(Math.max(1, Math.round((Date.now() - startTs.current) / 1000)));
    setPhase('recall');
  };
  useEffect(() => {
    if (phase === 'memorize' && remaining === 0) goRecall();
  }, [remaining, phase]);

  const exit = () => router.back();

  const startRound = () => {
    setDigits(genDigits(level.digits));
    setInput('');
    setRemaining(level.time);
    setHints(false);
    setScore(null);
    startTs.current = Date.now();
    setPhase('memorize');
  };

  const submit = () => {
    const sc = scoreNumbers(digits, input);
    recordNumbers(sc, elapsed);
    setScore(sc);
    setPhase('score');
    if (sc.lead === sc.total) haptics.success();
    else haptics.tapMedium();
    showToast(`+${sc.xpGain} XP earned`);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.paper, paddingTop: insets.top }}>
      <AppBar title="Numbers" subtitle="The Major System" onClose={exit} />
      {phase === 'lesson' && (
        <Lesson
          step={lessonStep}
          quizPick={quizPick}
          quizOk={quizOk}
          onPickQuiz={(w, ok) => {
            setQuizPick(w);
            setQuizOk(ok);
          }}
          onBack={() => (lessonStep > 0 ? setLessonStep((s) => s - 1) : exit())}
          onNext={() => (lessonStep >= LESSON_STEPS.length - 1 ? setPhase('ready') : setLessonStep((s) => s + 1))}
          onSkip={() => setPhase('ready')}
        />
      )}
      {phase === 'ready' && (
        <Ready levelId={levelId} onPick={setLevelId} onStart={startRound} />
      )}
      {phase === 'memorize' && (
        <Memorize
          digits={digits}
          total={total}
          remaining={remaining}
          hints={hints}
          onToggleHints={() => setHints((h) => !h)}
          onDone={goRecall}
        />
      )}
      {phase === 'recall' && (
        <Recall
          digits={digits}
          input={input}
          total={total}
          onKey={(d) => {
            haptics.tapKey();
            setInput((v) => (v.length >= total ? v : v + d));
          }}
          onDel={() => {
            haptics.tapKey();
            setInput((v) => v.slice(0, -1));
          }}
          onSubmit={submit}
          onEmpty={() => showToast('Type some digits first')}
        />
      )}
      {phase === 'score' && score && (
        <ScoreView
          score={score}
          digits={digits}
          input={input}
          elapsed={elapsed}
          onAgain={() => setPhase('ready')}
          onExit={exit}
        />
      )}
    </View>
  );
}

/* ----------------------------- LESSON ----------------------------- */

function Lesson({
  step,
  quizPick,
  quizOk,
  onPickQuiz,
  onBack,
  onNext,
  onSkip,
}: {
  step: number;
  quizPick: string | null;
  quizOk: boolean;
  onPickQuiz: (w: string, ok: boolean) => void;
  onBack: () => void;
  onNext: () => void;
  onSkip: () => void;
}) {
  const kind = LESSON_STEPS[step];
  return (
    <View style={{ flex: 1, paddingHorizontal: 20, paddingBottom: 20 }}>
      <View style={{ flexDirection: 'row', gap: 5, marginBottom: 16 }}>
        {LESSON_STEPS.map((_, i) => (
          <View key={i} style={{ flex: 1, height: 4, borderRadius: radii.pill, backgroundColor: i <= step ? colors.accent : colors.card2 }} />
        ))}
      </View>
      <Animated.View key={kind} entering={enterUp} style={{ flex: 1 }}>
        <Card style={{ flex: 1, padding: 22 }}>
          <ScrollView showsVerticalScrollIndicator={false}>
            {kind === 'map' && <LessonMap />}
            {kind === 'glue' && <LessonGlue />}
            {kind === 'encode' && <LessonEncode />}
            {kind === 'quiz' && <LessonQuiz pick={quizPick} ok={quizOk} onPick={onPickQuiz} />}
          </ScrollView>
        </Card>
      </Animated.View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 16 }}>
        <SquareButton onPress={onBack} />
        <Pressable onPress={onNext} style={btnDark}>
          <T s={15} w={700} c={colors.onInk}>
            {step >= LESSON_STEPS.length - 1 ? 'Got it — set up round' : 'Next'}
          </T>
          <ArrowRight size={17} color={colors.onInk} strokeWidth={2.2} />
        </Pressable>
      </View>
      <Pressable onPress={onSkip}>
        <T s={12.5} w={600} c={colors.ink3} style={{ textAlign: 'center', marginTop: 14 }}>
          I know this — skip to the round
        </T>
      </Pressable>
    </View>
  );
}

function Eyebrow({ children }: { children: string }) {
  return (
    <T s={11} w={700} ls={1.2} c={colors.accent} style={{ marginBottom: 6 }}>
      {children}
    </T>
  );
}

function LessonMap() {
  return (
    <View>
      <Eyebrow>THE CODE</Eyebrow>
      <T s={22} w={800} ls={-0.5} style={{ lineHeight: 25, marginBottom: 6 }}>
        Every digit is a consonant sound.
      </T>
      <T s={13.5} c={colors.ink2} style={{ lineHeight: 20, marginBottom: 16 }}>
        Learn these ten and you can turn any number into a picture. Vowels don't count — they're just glue.
      </T>
      {DIGIT_MAP.map(([d, sounds, hint]) => (
        <View key={d} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 7, borderBottomWidth: 1, borderBottomColor: colors.line }}>
          <View style={{ width: 30, height: 30, borderRadius: radii.sm, backgroundColor: colors.accentSoft, alignItems: 'center', justifyContent: 'center' }}>
            <T mono w={700} s={15} c={colors.accentDeep}>
              {d}
            </T>
          </View>
          <T mono w={700} s={14} style={{ minWidth: 90 }}>
            {sounds}
          </T>
          <T s={12} c={colors.ink3} style={{ flex: 1 }}>
            {hint}
          </T>
        </View>
      ))}
    </View>
  );
}

function LessonGlue() {
  return (
    <View>
      <Eyebrow>VOWELS ARE FREE</Eyebrow>
      <T s={22} w={800} ls={-0.5} style={{ lineHeight: 25, marginBottom: 6 }}>
        Glue the sounds into a word.
      </T>
      <T s={13.5} c={colors.ink2} style={{ lineHeight: 20, marginBottom: 20 }}>
        Take the number, read off its consonants, then pour vowels between them until a vivid noun pops out.
      </T>
      <View style={{ backgroundColor: colors.card2, borderRadius: radii.xl, padding: 18, alignItems: 'center' }}>
        <T mono w={700} s={34} ls={2}>
          1 4
        </T>
        <T s={13} c={colors.ink3} style={{ marginTop: 6, marginBottom: 2 }}>
          t / d · r
        </T>
        <ArrowDown size={18} color={colors.ink3} />
        <T mono s={14} c={colors.ink3} style={{ marginTop: 4 }}>
          T · R → "TiRe"
        </T>
        <T s={26} w={800} ls={-0.5} c={colors.accentDeep} style={{ marginTop: 8 }}>
          🛞 Tire
        </T>
      </View>
      <T s={12.5} c={colors.ink3} style={{ lineHeight: 19, marginTop: 16 }}>
        See a flaming tire rolling down your street. That picture is 14, forever.
      </T>
    </View>
  );
}

function LessonEncode() {
  const examples = ['42', '13', '07'].map((n) => pegByN(n)!);
  return (
    <View>
      <Eyebrow>PEGS</Eyebrow>
      <T s={22} w={800} ls={-0.5} style={{ lineHeight: 25, marginBottom: 16 }}>
        Three you'll use tonight.
      </T>
      <View style={{ gap: 10 }}>
        {examples.map((p) => (
          <View key={p.n} style={{ flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: colors.card2, borderRadius: radii.lg, padding: 13 }}>
            <T mono s={22} w={700} c={colors.accentDeep} style={{ minWidth: 34 }}>
              {p.n}
            </T>
            <View style={{ flex: 1 }}>
              <T s={16} w={700}>
                {p.word}
              </T>
              <T mono s={11.5} c={colors.ink3}>
                {p.sound}
              </T>
            </View>
            <T s={12} c={colors.ink2} style={{ maxWidth: 120, textAlign: 'right' }}>
              {p.hint}
            </T>
          </View>
        ))}
      </View>
    </View>
  );
}

function LessonQuiz({ pick, ok, onPick }: { pick: string | null; ok: boolean; onPick: (w: string, ok: boolean) => void }) {
  const options = [
    { w: 'Maid', ok: true },
    { w: 'Nun', ok: false },
    { w: 'Rhino', ok: false },
    { w: 'Sock', ok: false },
  ];
  return (
    <View>
      <Eyebrow>QUICK CHECK</Eyebrow>
      <T s={22} w={800} ls={-0.5} style={{ lineHeight: 25, marginBottom: 4 }}>
        Picture the number 31.
      </T>
      <T s={13.5} c={colors.ink2} style={{ lineHeight: 20, marginBottom: 16 }}>
        3 = m, 1 = t. Which image fits?
      </T>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
        {options.map((o) => {
          let bd: string = colors.line;
          let bg: string = colors.card;
          let fg: string = colors.ink;
          if (pick != null) {
            if (o.ok) {
              bd = colors.accent;
              bg = colors.accentSoft;
              fg = colors.accentDeep;
            } else if (pick === o.w) {
              bd = colors.err;
              bg = colors.errSoft;
              fg = colors.err;
            } else {
              fg = colors.ink3;
            }
          }
          return (
            <Pressable
              key={o.w}
              onPress={() => onPick(o.w, o.ok)}
              style={{ width: '47%', flexGrow: 1, paddingVertical: 16, borderRadius: radii.lg, borderWidth: 1.5, borderColor: bd, backgroundColor: bg, alignItems: 'center' }}
            >
              <T s={15} w={700} c={fg}>
                {o.w}
              </T>
            </Pressable>
          );
        })}
      </View>
      {pick != null && (
        <T s={13} w={600} c={ok ? colors.accent : colors.err} style={{ textAlign: 'center', marginTop: 14 }}>
          {ok ? 'Exactly — m + t spells "Maid".' : 'Close — 3 = m, 1 = t, so it’s "Maid".'}
        </T>
      )}
    </View>
  );
}

/* ----------------------------- READY ----------------------------- */

function Ready({ levelId, onPick, onStart }: { levelId: NumbersLevel['id']; onPick: (id: NumbersLevel['id']) => void; onStart: () => void }) {
  return (
    <View style={{ flex: 1, paddingHorizontal: 20, paddingTop: 8, paddingBottom: 20 }}>
      <T s={24} w={800} ls={-0.5} style={{ marginBottom: 4 }}>
        Choose your level
      </T>
      <T s={13.5} c={colors.ink2} style={{ lineHeight: 20, marginBottom: 18 }}>
        Memorize the digits in order, then type them back. Speed and accuracy both score.
      </T>
      <View style={{ gap: 11 }}>
        {LEVEL_ORDER.map((id) => {
          const l = LEVELS[id];
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
              <T s={11} c={active ? 'rgba(251,249,244,0.6)' : colors.ink3} style={{ maxWidth: 108, textAlign: 'right', lineHeight: 15 }}>
                benchmark{'\n'}
                {l.bench}
              </T>
            </Pressable>
          );
        })}
      </View>
      <View style={{ flex: 1 }} />
      <Pressable onPress={onStart} style={btnAccent}>
        <T s={16} w={700} c="#fff">
          Start round
        </T>
        <Play size={18} color="#fff" />
      </Pressable>
    </View>
  );
}

/* ----------------------------- MEMORIZE ----------------------------- */

function Memorize({
  digits,
  total,
  remaining,
  hints,
  onToggleHints,
  onDone,
}: {
  digits: string;
  total: number;
  remaining: number;
  hints: boolean;
  onToggleHints: () => void;
  onDone: () => void;
}) {
  const pairs = chunk2(digits);
  const timerColor = remaining <= 10 ? colors.err : colors.ink;
  return (
    <View style={{ flex: 1, paddingHorizontal: 20, paddingBottom: 18 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <View>
          <T s={11} w={700} ls={1} c={colors.ink3}>
            MEMORIZE
          </T>
          <T s={13} w={600} c={colors.ink2}>
            {total} digits, in order
          </T>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line, borderRadius: radii.lg, paddingVertical: 8, paddingHorizontal: 14 }}>
          <Timer size={15} color={timerColor} />
          <T mono w={700} s={18} c={timerColor}>
            {fmtTime(remaining)}
          </T>
        </View>
      </View>
      <Card style={{ flex: 1, padding: 16 }}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
          {pairs.map((p, i) => (
            <View key={i} style={{ alignItems: 'center', gap: 3, minWidth: 54 }}>
              <T mono s={25} w={700} ls={1} style={{ backgroundColor: colors.card2, borderRadius: radii.sm, paddingVertical: 6, paddingHorizontal: 11, overflow: 'hidden' }}>
                {p}
              </T>
              {hints && (
                <T s={10} w={600} c={colors.accent} style={{ height: 13 }}>
                  {pegByN(p)?.word ?? ''}
                </T>
              )}
            </View>
          ))}
        </ScrollView>
      </Card>
      <Pressable onPress={onToggleHints}>
        <T s={12.5} w={600} c={colors.ink3} style={{ textAlign: 'center', marginVertical: 12 }}>
          {hints ? 'Hide image hints' : 'Show image hints (cheat)'}
        </T>
      </Pressable>
      <Pressable onPress={onDone} style={[btnDark, { height: 52 }]}>
        <T s={15.5} w={700} c={colors.onInk}>
          I've got it — recall now
        </T>
      </Pressable>
    </View>
  );
}

/* ----------------------------- RECALL ----------------------------- */

function Recall({
  digits,
  input,
  total,
  onKey,
  onDel,
  onSubmit,
  onEmpty,
}: {
  digits: string;
  input: string;
  total: number;
  onKey: (d: string) => void;
  onDel: () => void;
  onSubmit: () => void;
  onEmpty: () => void;
}) {
  const display = input.padEnd(total, '·');
  const pairs = chunk2(display);
  const canSubmit = input.length > 0;
  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'del', '0', 'done'];
  return (
    <View style={{ flex: 1, paddingHorizontal: 18, paddingBottom: 14 }}>
      <View style={{ alignItems: 'center', marginBottom: 10 }}>
        <T s={11} w={700} ls={1} c={colors.accent}>
          RECALL
        </T>
        <T s={13} w={600} c={colors.ink2}>
          Type the digits in order · {input.length}/{total}
        </T>
      </View>
      <View style={{ minHeight: 70, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line, borderRadius: radii.xl, padding: 12, flexDirection: 'row', flexWrap: 'wrap', gap: 6, alignContent: 'flex-start', justifyContent: 'center', marginBottom: 12 }}>
        {pairs.map((p, i) => (
          <T key={i} mono s={20} w={700} ls={1} c={p.includes('·') ? colors.ink3 : colors.ink} style={{ backgroundColor: colors.card2, borderRadius: 8, paddingVertical: 4, paddingHorizontal: 9, overflow: 'hidden' }}>
            {p}
          </T>
        ))}
      </View>
      <View style={{ flex: 1 }} />
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 9 }}>
        {keys.map((k) => {
          const isDel = k === 'del';
          const isDone = k === 'done';
          const onPress = isDel ? onDel : isDone ? (canSubmit ? onSubmit : onEmpty) : () => onKey(k);
          const bg = isDel ? colors.card2 : isDone ? (canSubmit ? colors.accent : colors.card2) : colors.card;
          const fg = isDel ? colors.ink2 : isDone ? (canSubmit ? '#fff' : colors.ink3) : colors.ink;
          const bd = isDone ? 'transparent' : colors.line;
          return (
            <Pressable
              key={k}
              onPress={onPress}
              style={{ width: '31.5%', flexGrow: 1, height: 56, borderRadius: radii.lg, backgroundColor: bg, borderWidth: 1.5, borderColor: bd, alignItems: 'center', justifyContent: 'center' }}
            >
              {isDone ? (
                <T s={16} w={700} c={fg}>
                  Done
                </T>
              ) : (
                <T mono s={22} w={700} c={fg}>
                  {isDel ? '⌫' : k}
                </T>
              )}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

/* ----------------------------- SCORE ----------------------------- */

function ScoreView({
  score,
  digits,
  input,
  elapsed,
  onAgain,
  onExit,
}: {
  score: NumbersScore;
  digits: string;
  input: string;
  elapsed: number;
  onAgain: () => void;
  onExit: () => void;
}) {
  const pairs = scorePairs(digits, input);
  return (
    <View style={{ flex: 1, paddingHorizontal: 20, paddingBottom: 20 }}>
      <Animated.View entering={enterUp} style={{ alignItems: 'center', marginBottom: 14 }}>
        <T s={13} w={700} ls={1} c={colors.ink3}>
          ROUND COMPLETE
        </T>
        <T mono s={52} w={700} ls={-1.5} c={colors.accent} style={{ lineHeight: 56, marginVertical: 6 }}>
          {score.lead}
        </T>
        <T s={13.5} c={colors.ink2}>
          digits correct in a row · of {score.total}
        </T>
      </Animated.View>
      <View style={{ flexDirection: 'row', gap: 10, marginBottom: 14 }}>
        <StatBox value={`${score.accuracy}%`} label="accuracy" />
        <StatBox value={fmtTime(elapsed)} label="time" />
        <StatBox value={`+${score.xpGain}`} label="XP" accent />
      </View>
      <T s={11} w={700} ls={0.8} c={colors.ink3} style={{ marginBottom: 8 }}>
        YOUR DIGITS
      </T>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ flexDirection: 'row', flexWrap: 'wrap', gap: 7, alignContent: 'flex-start' }} showsVerticalScrollIndicator={false}>
        {pairs.map((p, i) => (
          <View key={i} style={{ alignItems: 'center', gap: 2, paddingVertical: 6, paddingHorizontal: 9, borderRadius: radii.sm, backgroundColor: p.ok ? colors.accentSoft : colors.errSoft }}>
            <T mono s={17} w={700} c={p.ok ? colors.accent : colors.err}>
              {p.target}
            </T>
            <T mono s={10} c={colors.ink3}>
              {p.typed}
            </T>
          </View>
        ))}
      </ScrollView>
      <View style={{ backgroundColor: colors.card2, borderRadius: radii.md, paddingVertical: 11, paddingHorizontal: 14, marginVertical: 12 }}>
        <T s={12.5} c={colors.ink2} style={{ textAlign: 'center' }}>
          At this pace you'd place: <T s={12.5} w={700} c={colors.ink}>{benchPlace(score.lead)}</T>
        </T>
      </View>
      <View style={{ flexDirection: 'row', gap: 10 }}>
        <Pressable onPress={onAgain} style={[btnSoft, { flex: 1 }]}>
          <T s={14.5} w={700} c={colors.ink}>
            Again
          </T>
        </Pressable>
        <Pressable onPress={onExit} style={[btnDark, { flex: 1, height: 50 }]}>
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

/* shared button styles */
const btnDark = {
  flex: 1,
  height: 48,
  borderRadius: radii.lg,
  backgroundColor: colors.ink,
  flexDirection: 'row' as const,
  alignItems: 'center' as const,
  justifyContent: 'center' as const,
  gap: 8,
};
const btnAccent = {
  height: 54,
  borderRadius: radii.xl,
  backgroundColor: colors.accent,
  flexDirection: 'row' as const,
  alignItems: 'center' as const,
  justifyContent: 'center' as const,
  gap: 9,
};
const btnSoft = {
  height: 50,
  borderRadius: radii.lg,
  backgroundColor: colors.card,
  borderWidth: 1,
  borderColor: colors.line,
  alignItems: 'center' as const,
  justifyContent: 'center' as const,
};
