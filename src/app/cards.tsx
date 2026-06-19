import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CardChip } from '@/components/CardChip';
import { ArrowRight, Play, Timer } from '@/components/Icon';
import { AppBar, CountUp, ProgressBar, SquareButton, T, useEntering } from '@/components/ui';
import { CARDS_LEVELS, CARDS_LEVEL_ORDER, COMBO_SIZES, wordForCard, type CardDef, type CardsLevel } from '@/data/cards';
import { dealRound, scoreCards, type CardsScore } from '@/engine/cards';
import { fmtTime } from '@/engine/digits';
import { shuffle } from '@/engine/images';
import * as haptics from '@/lib/haptics';
import { useProgress } from '@/state/store';
import { useUI } from '@/state/ui';
import { colors, radii } from '@/theme/tokens';

type Phase = 'ready' | 'memorize' | 'recall' | 'score';

export default function CardsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const recordCards = useProgress((s) => s.recordCards);
  const cardWords = useProgress((s) => s.cardWords);
  const cardCombo = useProgress((s) => s.cardCombo);
  const setCardCombo = useProgress((s) => s.setCardCombo);
  const showToast = useUI((s) => s.showToast);

  const [phase, setPhase] = useState<Phase>('ready');
  const [levelId, setLevelId] = useState<CardsLevel['id']>('beginner');
  const [deckA, setDeckA] = useState<CardDef[]>([]);
  const [pool, setPool] = useState<CardDef[]>([]);
  const [answer, setAnswer] = useState<CardDef[]>([]);
  const [remaining, setRemaining] = useState(0);
  const [hints, setHints] = useState(true);
  const [elapsed, setElapsed] = useState(0);
  const [score, setScore] = useState<CardsScore | null>(null);
  const startTs = useRef(0);

  const level = CARDS_LEVELS[levelId];

  useEffect(() => {
    if (phase !== 'memorize') return;
    const id = setInterval(() => setRemaining((r) => Math.max(0, r - 1)), 1000);
    return () => clearInterval(id);
  }, [phase]);

  const goRecall = () => {
    setElapsed(Math.max(1, Math.round((Date.now() - startTs.current) / 1000)));
    setPool(shuffle(deckA));
    setAnswer([]);
    setPhase('recall');
  };
  useEffect(() => {
    if (phase === 'memorize' && remaining === 0) goRecall();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remaining, phase]);

  const exit = () => router.back();

  const start = () => {
    setDeckA(dealRound(level.count));
    setAnswer([]);
    setRemaining(level.time);
    setScore(null);
    startTs.current = Date.now();
    setPhase('memorize');
  };

  const place = (c: CardDef) => {
    haptics.tapKey();
    setAnswer((a) => [...a, c]);
  };
  const unplace = (i: number) => {
    haptics.tapKey();
    setAnswer((a) => a.filter((_, k) => k !== i));
  };

  const submit = () => {
    const sc = scoreCards(deckA, answer);
    recordCards(sc.correct, sc.total, elapsed);
    setScore(sc);
    setPhase('score');
    if (sc.correct === sc.total) haptics.success();
    else haptics.tapMedium();
    showToast(`+${sc.xpGain} XP earned`);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.paper, paddingTop: insets.top }}>
      <AppBar title="Cards" subtitle="Speed Cards · PAO" onClose={exit} />
      {phase === 'ready' && (
        <Ready
          levelId={levelId}
          onPick={setLevelId}
          combo={cardCombo}
          onCombo={setCardCombo}
          onEdit={() => router.push('/cards-system')}
          onStart={start}
        />
      )}
      {phase === 'memorize' && (
        <Memorize
          deck={deckA}
          combo={cardCombo}
          cardWords={cardWords}
          remaining={remaining}
          hints={hints}
          onToggleHints={() => setHints((h) => !h)}
          onDone={goRecall}
        />
      )}
      {phase === 'recall' && (
        <Recall pool={pool} answer={answer} total={deckA.length} onPlace={place} onUnplace={unplace} onSubmit={submit} onEmpty={() => showToast('Place the cards first')} />
      )}
      {phase === 'score' && score && (
        <ScoreView score={score} deck={deckA} answer={answer} elapsed={elapsed} onAgain={() => setPhase('ready')} onExit={exit} />
      )}
    </View>
  );
}

/* ----------------------------- READY ----------------------------- */

function Ready({
  levelId,
  onPick,
  combo,
  onCombo,
  onEdit,
  onStart,
}: {
  levelId: CardsLevel['id'];
  onPick: (id: CardsLevel['id']) => void;
  combo: number;
  onCombo: (n: number) => void;
  onEdit: () => void;
  onStart: () => void;
}) {
  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 20 }}>
      <T s={24} w={800} ls={-0.5} style={{ marginBottom: 4 }}>
        Memorize the deck, then rebuild it
      </T>
      <T s={13.5} c={colors.ink2} style={{ lineHeight: 20, marginBottom: 18 }}>
        Study the shuffled deck in order. Then it's shuffled again — and you reorganize it back into the exact order you memorized. Chain each card's image into a story.
      </T>

      <T s={11} w={700} ls={0.8} c={colors.ink3} style={{ marginBottom: 9 }}>
        LEVEL
      </T>
      <View style={{ gap: 11, marginBottom: 20 }}>
        {CARDS_LEVEL_ORDER.map((id) => {
          const l = CARDS_LEVELS[id];
          const active = id === levelId;
          return (
            <Pressable key={id} onPress={() => onPick(id)} style={{ flexDirection: 'row', alignItems: 'center', borderRadius: radii.xl, padding: 16, backgroundColor: active ? colors.ink : colors.card, borderWidth: 1.5, borderColor: active ? colors.ink : colors.line }}>
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

      <T s={11} w={700} ls={0.8} c={colors.ink3} style={{ marginBottom: 9 }}>
        CARDS PER STORY
      </T>
      <View style={{ flexDirection: 'row', gap: 9, marginBottom: 8 }}>
        {COMBO_SIZES.map((n) => {
          const active = n === combo;
          return (
            <Pressable key={n} onPress={() => onCombo(n)} style={{ flex: 1, height: 48, borderRadius: radii.md, backgroundColor: active ? colors.accent : colors.card, borderWidth: 1.5, borderColor: active ? colors.accent : colors.line, alignItems: 'center', justifyContent: 'center' }}>
              <T mono w={700} s={17} c={active ? '#fff' : colors.ink}>
                {n}
              </T>
            </Pressable>
          );
        })}
      </View>
      <T s={11.5} c={colors.ink3} style={{ lineHeight: 17, marginBottom: 20 }}>
        Group {combo} card{combo === 1 ? '' : 's'} into one scene while memorizing — Person · Action · Object works well at 3.
      </T>

      <Pressable onPress={onEdit} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderRadius: radii.lg, padding: 15, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line, marginBottom: 22 }}>
        <View>
          <T s={14.5} w={600}>
            Edit your card system
          </T>
          <T s={12} c={colors.ink3} style={{ marginTop: 1 }}>
            Assign your own word to each of the 52 cards
          </T>
        </View>
        <ArrowRight size={18} color={colors.ink3} strokeWidth={2} />
      </Pressable>

      <Pressable onPress={onStart} style={accentBtn}>
        <T s={16} w={700} c="#fff">
          Start round
        </T>
        <Play size={18} color="#fff" />
      </Pressable>
    </ScrollView>
  );
}

/* ----------------------------- MEMORIZE ----------------------------- */

function Memorize({
  deck,
  combo,
  cardWords,
  remaining,
  hints,
  onToggleHints,
  onDone,
}: {
  deck: CardDef[];
  combo: number;
  cardWords: Record<string, string>;
  remaining: number;
  hints: boolean;
  onToggleHints: () => void;
  onDone: () => void;
}) {
  const [i, setI] = useState(0);
  const total = deck.length;
  const card = deck[i];
  const timerColor = remaining <= 10 ? colors.err : colors.ink;
  const scene = Math.floor(i / combo) + 1;
  const sceneStart = (scene - 1) * combo;
  const sceneSize = Math.min(combo, total - sceneStart);
  const posInScene = i - sceneStart + 1;
  const pct = Math.round(((i + 1) / total) * 100);
  const next = () => {
    haptics.tapKey();
    if (i >= total - 1) onDone();
    else setI(i + 1);
  };
  const back = () => {
    if (i > 0) {
      haptics.tapKey();
      setI(i - 1);
    }
  };
  if (!card) return null;
  const cardColor = card.color === 'red' ? colors.err : colors.ink;
  return (
    <View style={{ flex: 1, paddingHorizontal: 20, paddingBottom: 20 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <View>
          <T s={11} w={700} ls={1} c={colors.ink3}>
            MEMORIZE
          </T>
          <T s={13} w={600} c={colors.ink2}>
            Card {i + 1} of {total}
          </T>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line, borderRadius: radii.lg, paddingVertical: 8, paddingHorizontal: 14 }}>
          <Timer size={15} color={timerColor} />
          <T mono w={700} s={18} c={timerColor}>
            {fmtTime(remaining)}
          </T>
        </View>
      </View>
      <ProgressBar pct={pct} height={6} style={{ marginBottom: 4 }} />

      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <T s={12} w={700} ls={0.8} c={colors.ink3}>
          SCENE {scene} · CARD {posInScene} / {sceneSize}
        </T>
        <View
          style={{
            width: 150,
            height: 210,
            borderRadius: 20,
            backgroundColor: '#fff',
            borderWidth: 1,
            borderColor: colors.line,
            alignItems: 'center',
            justifyContent: 'center',
            marginVertical: 18,
            shadowColor: '#000',
            shadowOpacity: 0.12,
            shadowRadius: 16,
            shadowOffset: { width: 0, height: 10 },
            elevation: 4,
          }}
        >
          <T w={800} s={64} c={cardColor}>
            {card.rank}
          </T>
          <T s={52} c={cardColor}>
            {card.sym}
          </T>
        </View>
        {hints ? (
          <T s={22} w={800} ls={-0.3} c={colors.accentDeep}>
            {wordForCard(card, cardWords)}
          </T>
        ) : (
          <T s={13} c={colors.ink3}>
            words hidden
          </T>
        )}
        <T s={12.5} c={colors.ink3} style={{ textAlign: 'center', lineHeight: 18, maxWidth: 240, marginTop: 8 }}>
          Weave it into your scene-{scene} story.
        </T>
      </View>

      <Pressable onPress={onToggleHints}>
        <T s={12.5} w={600} c={colors.ink3} style={{ textAlign: 'center', marginBottom: 12 }}>
          {hints ? 'Hide words' : 'Show words'}
        </T>
      </Pressable>
      <View style={{ flexDirection: 'row', gap: 10 }}>
        <SquareButton onPress={back} />
        <Pressable onPress={next} style={[darkBtn, { flex: 1, height: 52 }]}>
          <T s={15} w={700} c={colors.onInk}>
            {i >= total - 1 ? 'Done — rebuild' : 'Next card'}
          </T>
          <ArrowRight size={16} color={colors.onInk} strokeWidth={2.2} />
        </Pressable>
      </View>
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
  onEmpty,
}: {
  pool: CardDef[];
  answer: CardDef[];
  total: number;
  onPlace: (c: CardDef) => void;
  onUnplace: (i: number) => void;
  onSubmit: () => void;
  onEmpty: () => void;
}) {
  const placedIds = new Set(answer.map((c) => c.id));
  const remaining = pool.filter((c) => !placedIds.has(c.id));
  const complete = answer.length === total;
  return (
    <View style={{ flex: 1, paddingHorizontal: 18, paddingBottom: 14 }}>
      <View style={{ alignItems: 'center', marginBottom: 10 }}>
        <T s={11} w={700} ls={1} c={colors.accent}>
          REBUILD THE ORDER
        </T>
        <T s={13} w={600} c={colors.ink2}>
          Tap cards back into the order you memorized · {answer.length}/{total}
        </T>
      </View>
      <T s={10} w={700} ls={0.8} c={colors.ink3} style={{ marginBottom: 6 }}>
        YOUR ORDER
      </T>
      <View style={{ minHeight: 64, maxHeight: 150, marginBottom: 12 }}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ flexDirection: 'row', flexWrap: 'wrap', gap: 5, justifyContent: 'flex-start' }}>
          {Array.from({ length: total }).map((_, i) => {
            const c = answer[i];
            if (c)
              return (
                <Pressable key={i} onPress={() => onUnplace(i)}>
                  <CardChip card={c} size="sm" selected />
                </Pressable>
              );
            return (
              <View key={i} style={{ width: 40, height: 54, borderRadius: radii.sm, backgroundColor: colors.card2, alignItems: 'center', justifyContent: 'center' }}>
                <T mono s={12} c={colors.ink3}>
                  {i + 1}
                </T>
              </View>
            );
          })}
        </ScrollView>
      </View>
      <T s={10} w={700} ls={0.8} c={colors.ink3} style={{ marginBottom: 6 }}>
        REMAINING
      </T>
      <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }} contentContainerStyle={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, justifyContent: 'flex-start' }}>
        {remaining.map((c) => (
          <Pressable key={c.id} onPress={() => onPlace(c)}>
            <CardChip card={c} size="sm" />
          </Pressable>
        ))}
      </ScrollView>
      <Pressable onPress={complete ? onSubmit : onEmpty} style={[accentBtn, { marginTop: 12, height: 52, backgroundColor: complete ? colors.accent : colors.card2 }]}>
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
  deck,
  answer,
  elapsed,
  onAgain,
  onExit,
}: {
  score: CardsScore;
  deck: CardDef[];
  answer: CardDef[];
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
          cards in the right place · {score.lead} in a row
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
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} contentContainerStyle={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, alignContent: 'flex-start' }}>
        {deck.map((card, i) => {
          const got = answer[i];
          const ok = got?.id === card.id;
          return (
            <View key={i} style={{ alignItems: 'center', gap: 2 }}>
              <CardChip card={card} size="sm" />
              <T mono s={10} c={ok ? colors.accent : colors.err}>
                {ok ? '✓' : got ? got.label : '—'}
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
