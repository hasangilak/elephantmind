import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { ArrowRight, Check, Clock, Close } from '@/components/Icon';
import { PageHeader, Screen } from '@/components/layout';
import { Card, Pill, ProgressBar, T, useEntering } from '@/components/ui';
import { pegByN } from '@/data/majorSystem';
import { dueIds, SR_LABELS, stageCounts } from '@/engine/sr';
import * as haptics from '@/lib/haptics';
import { todayEpochDay, useProgress } from '@/state/store';
import { useUI } from '@/state/ui';
import { colors, radii } from '@/theme/tokens';

/** Max cards to review in one session (keeps the first session manageable). */
const SESSION_CAP = 20;

export default function ReviewScreen() {
  const srCards = useProgress((s) => s.srCards);
  const reviewSr = useProgress((s) => s.reviewSr);
  const finishReview = useProgress((s) => s.finishReview);
  const showToast = useUI((s) => s.showToast);

  const [started, setStarted] = useState(false);
  const [queue, setQueue] = useState<string[]>([]);
  const [pos, setPos] = useState(0);
  const [reveal, setReveal] = useState(false);
  const [reviewed, setReviewed] = useState(0);
  const [got, setGot] = useState(0);

  const counts = stageCounts(srCards);
  const due = dueIds(srCards, todayEpochDay());
  const done = started && pos >= queue.length;

  const start = () => {
    if (!due.length) {
      showToast('All caught up — come back tomorrow');
      return;
    }
    setQueue(due.slice(0, SESSION_CAP));
    setPos(0);
    setReveal(false);
    setReviewed(0);
    setGot(0);
    setStarted(true);
  };

  const answer = (ok: boolean) => {
    if (ok) haptics.success();
    else haptics.error();
    reviewSr(queue[pos], ok);
    const newGot = got + (ok ? 1 : 0);
    const newPos = pos + 1;
    setGot(newGot);
    setReviewed((r) => r + 1);
    setPos(newPos);
    setReveal(false);
    if (newPos >= queue.length) finishReview(newGot);
  };

  const dayLabel = 'Today';

  return (
    <Screen>
      <PageHeader
        eyebrow="Spaced repetition"
        title="Review"
        right={
          <Pill style={{ paddingHorizontal: 13 }}>
            <Clock size={14} color={colors.ink2} />
            <T mono w={700} s={13}>
              {dayLabel}
            </T>
          </Pill>
        }
      />

      {!started && <Overview counts={counts} dueCount={due.length} onStart={start} />}

      {started && !done && (
        <ActiveCard
          n={queue[pos]}
          pos={pos}
          qlen={queue.length}
          reveal={reveal}
          onReveal={() => {
            haptics.tapMedium();
            setReveal(true);
          }}
          onAnswer={answer}
        />
      )}

      {started && done && <Done reviewed={reviewed} got={got} onReset={() => setStarted(false)} />}
    </Screen>
  );
}

function Overview({
  counts,
  dueCount,
  onStart,
}: {
  counts: number[];
  dueCount: number;
  onStart: () => void;
}) {
  const maxTl = Math.max(1, counts[1], counts[2], counts[3], counts[4], counts[5]);
  return (
    <View>
      {/* rule of five */}
      <View style={{ backgroundColor: colors.ink, borderRadius: radii.xxl, padding: 18, marginBottom: 16 }}>
        <T s={11} w={600} ls={1.2} c="rgba(251,249,244,0.55)" style={{ marginBottom: 3 }}>
          THE RULE OF FIVE
        </T>
        <T s={16} w={700} c={colors.onInk} style={{ lineHeight: 22, marginBottom: 16 }}>
          Review each image now, tomorrow, next week, next month, then three months out — and it's yours for life.
        </T>
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 6 }}>
          {SR_LABELS.map((label, i) => {
            const count = counts[i + 1];
            const barH = Math.round(6 + (count / maxTl) * 46);
            return (
              <View key={label} style={{ flex: 1, alignItems: 'center' }}>
                <View style={{ height: 54, justifyContent: 'flex-end', width: '100%', alignItems: 'center' }}>
                  <View style={{ width: '100%', maxWidth: 34, borderTopLeftRadius: 7, borderTopRightRadius: 7, backgroundColor: colors.accent, height: barH }}>
                    <T mono s={11} w={700} c={colors.onInk} style={{ position: 'absolute', top: -17, left: 0, right: 0, textAlign: 'center' }}>
                      {count}
                    </T>
                  </View>
                </View>
                <T s={9} w={600} c="rgba(251,249,244,0.5)" style={{ marginTop: 6, textAlign: 'center' }}>
                  {label}
                </T>
              </View>
            );
          })}
        </View>
      </View>

      {/* counts */}
      <View style={{ flexDirection: 'row', gap: 10, marginBottom: 16 }}>
        <CountBox value={dueCount} label="due now" accent />
        <CountBox value={counts[0]} label="still new" />
        <CountBox value={counts[5]} label="mastered" />
      </View>

      <Pressable onPress={onStart} style={accentBtn}>
        <T s={16} w={700} c="#fff">
          {dueCount ? `Review ${Math.min(dueCount, SESSION_CAP)} now` : 'All caught up'}
        </T>
        <ArrowRight size={17} color="#fff" strokeWidth={2.2} />
      </Pressable>

      <T s={11.5} c={colors.ink3} style={{ textAlign: 'center', marginTop: 16, lineHeight: 17 }}>
        Cards return on their own schedule — now, tomorrow, next week, next month, then three months out.
      </T>
    </View>
  );
}

function CountBox({ value, label, accent }: { value: number; label: string; accent?: boolean }) {
  return (
    <View style={{ flex: 1, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line, borderRadius: radii.xl, padding: 13, alignItems: 'center' }}>
      <T mono w={700} s={22} c={accent ? colors.accent : colors.ink}>
        {value}
      </T>
      <T s={11} c={colors.ink3} style={{ marginTop: 1 }}>
        {label}
      </T>
    </View>
  );
}

function ActiveCard({
  n,
  pos,
  qlen,
  reveal,
  onReveal,
  onAnswer,
}: {
  n: string;
  pos: number;
  qlen: number;
  reveal: boolean;
  onReveal: () => void;
  onAnswer: (ok: boolean) => void;
}) {
  const peg = pegByN(n);
  const pct = qlen ? Math.round((pos / qlen) * 100) : 0;
  const entering = useEntering();
  return (
    <View>
      <ProgressBar pct={pct} height={6} style={{ marginBottom: 6 }} />
      <T mono s={11} c={colors.ink3} style={{ textAlign: 'right', marginBottom: 16 }}>
        {pos} / {qlen}
      </T>
      <Animated.View key={n} entering={entering}>
        <Card style={{ borderRadius: 24, padding: 30, alignItems: 'center' }}>
          <T s={12} w={600} ls={1} c={colors.ink3}>
            WHAT'S THE IMAGE FOR
          </T>
          <T mono s={72} w={700} ls={2} c={colors.ink} style={{ lineHeight: 80, marginVertical: 6 }}>
            {n}
          </T>
          {reveal && peg && (
            <Animated.View entering={entering} style={{ borderTopWidth: 1, borderTopColor: colors.line, marginTop: 14, paddingTop: 18, alignItems: 'center', alignSelf: 'stretch' }}>
              <T s={32} w={800} ls={-0.5} c={colors.accentDeep}>
                {peg.word}
              </T>
              <T mono s={12.5} c={colors.ink3} style={{ marginVertical: 4 }}>
                {peg.sound}
              </T>
              <T s={13.5} c={colors.ink2} style={{ lineHeight: 19, textAlign: 'center' }}>
                {peg.hint}
              </T>
            </Animated.View>
          )}
        </Card>
      </Animated.View>

      {!reveal && (
        <Pressable onPress={onReveal} style={[darkBtn, { marginTop: 18, height: 54 }]}>
          <T s={16} w={700} c={colors.onInk}>
            Reveal the image
          </T>
        </Pressable>
      )}
      {reveal && (
        <View style={{ flexDirection: 'row', gap: 10, marginTop: 18 }}>
          <Pressable onPress={() => onAnswer(false)} style={{ flex: 1, height: 54, borderRadius: radii.xl, backgroundColor: colors.errSoft, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7 }}>
            <Close size={17} color={colors.err} strokeWidth={2.4} />
            <T s={15} w={700} c={colors.err}>
              Missed it
            </T>
          </Pressable>
          <Pressable onPress={() => onAnswer(true)} style={{ flex: 1, height: 54, borderRadius: radii.xl, backgroundColor: colors.accent, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7 }}>
            <Check size={18} color="#fff" strokeWidth={2.6} />
            <T s={15} w={700} c="#fff">
              Got it
            </T>
          </Pressable>
        </View>
      )}
    </View>
  );
}

function Done({ reviewed, got, onReset }: { reviewed: number; got: number; onReset: () => void }) {
  const entering = useEntering();
  return (
    <Animated.View entering={entering} style={{ alignItems: 'center', paddingVertical: 30, paddingHorizontal: 10 }}>
      <View style={{ width: 68, height: 68, borderRadius: 22, backgroundColor: colors.accentSoft, alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}>
        <Check size={34} color={colors.accentDeep} strokeWidth={2.6} />
      </View>
      <T s={24} w={800} ls={-0.5}>
        Session cleared
      </T>
      <T s={14} c={colors.ink2} style={{ textAlign: 'center', lineHeight: 21, maxWidth: 250, marginVertical: 8 }}>
        You reviewed {reviewed} images — {got} recalled. Each correct one just jumped to its next Rule-of-Five checkpoint.
      </T>
      <Pressable onPress={onReset} style={[darkBtn, { width: '100%', maxWidth: 280, height: 52, marginTop: 14 }]}>
        <T s={15} w={700} c={colors.onInk}>
          Back to schedule
        </T>
      </Pressable>
    </Animated.View>
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
};
