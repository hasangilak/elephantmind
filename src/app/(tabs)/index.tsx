import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { ArrowRight, ChevronRight, Flame, Lock } from '@/components/Icon';
import { Screen } from '@/components/layout';
import { Card, enterUp, Pill, ProgressBar, Ring, T } from '@/components/ui';
import { dueIds } from '@/engine/sr';
import { levelForXp, rankForLevel, xpInto, xpPct, greetingFor, XP_PER_LEVEL } from '@/engine/leveling';
import { pegsLearned, useProgress } from '@/state/store';
import { useUI } from '@/state/ui';
import { colors, radii } from '@/theme/tokens';

interface Mode {
  glyph: string;
  name: string;
  meta: string;
  tag?: string;
  locked?: boolean;
  accentIcon?: boolean;
  onPress: () => void;
}

interface Tier {
  num: string;
  label: string;
  sub: string;
  status: string;
  statusMuted?: boolean;
  pct: number;
  modes: Mode[];
}

function ModeRow({ mode }: { mode: Mode }) {
  return (
    <Pressable
      onPress={mode.onPress}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderTopWidth: 1,
        borderTopColor: colors.line,
      }}
    >
      <View
        style={{
          width: 30,
          height: 30,
          borderRadius: radii.sm,
          backgroundColor: mode.accentIcon ? colors.accentSoft : colors.card2,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <T w={800} s={13} c={mode.accentIcon ? colors.accentDeep : colors.ink2}>
          {mode.glyph}
        </T>
      </View>
      <View style={{ flex: 1, minWidth: 0 }}>
        <T s={14.5} w={600} ls={-0.1} c={mode.locked ? colors.ink3 : colors.ink}>
          {mode.name}
        </T>
        <T s={11.5} c={colors.ink3}>
          {mode.meta}
        </T>
      </View>
      {mode.tag ? (
        <T mono s={11} w={600} c={colors.ink3}>
          {mode.tag}
        </T>
      ) : null}
      {mode.locked ? (
        <Lock size={18} color={colors.ink3} strokeWidth={2} />
      ) : (
        <ChevronRight size={18} color={mode.accentIcon ? colors.accent : colors.ink3} strokeWidth={2} />
      )}
    </Pressable>
  );
}

function TierCard({ tier, index }: { tier: Tier; index: number }) {
  return (
    <Animated.View entering={enterUp.delay(index * 60)}>
      <Card style={{ overflow: 'hidden' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 13, padding: 15, paddingBottom: 13 }}>
          <Ring pct={tier.pct} label={`${Math.round(tier.pct)}%`} />
          <View style={{ flex: 1, minWidth: 0 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <T s={10.5} w={700} ls={1} c={colors.ink3}>
                TIER {tier.num}
              </T>
              <T s={10.5} w={600} c={tier.statusMuted ? colors.ink3 : colors.accent}>
                {tier.status}
              </T>
            </View>
            <T s={16.5} w={700} ls={-0.3} style={{ marginTop: 1 }}>
              {tier.label}
            </T>
            <T s={12.5} c={colors.ink3} style={{ marginTop: 1, lineHeight: 17 }}>
              {tier.sub}
            </T>
          </View>
        </View>
        <View>
          {tier.modes.map((m) => (
            <ModeRow key={m.name} mode={m} />
          ))}
        </View>
      </Card>
    </Animated.View>
  );
}

export default function HomeScreen() {
  const router = useRouter();
  const xp = useProgress((s) => s.xp);
  const streak = useProgress((s) => s.streak);
  const srCards = useProgress((s) => s.srCards);
  const srDay = useProgress((s) => s.srDay);
  const showToast = useUI((s) => s.showToast);

  const level = levelForXp(xp);
  const rank = rankForLevel(level);
  const pegs = pegsLearned(srCards);
  const dueCount = dueIds(srCards, srDay).length;

  const onLocked = () => showToast('Unlocks later — see Roadmap');
  const tier2Pct = Math.min(72, 30 + srCards.filter((c) => c.stage >= 2).length * 4);

  const tiers: Tier[] = [
    {
      num: '1',
      label: 'Foundations',
      sub: 'Memory Palace + Link method',
      status: 'In progress',
      pct: 80,
      modes: [
        {
          glyph: 'W',
          name: 'Words · Memory Palace',
          meta: 'Walk a 12-room palace',
          tag: 'PLAY',
          accentIcon: true,
          onPress: () => router.push('/palace'),
        },
        { glyph: 'I', name: 'Images · Link / Story', meta: '30 images in a chain', tag: '78%', onPress: onLocked },
      ],
    },
    {
      num: '2',
      label: 'Encoding systems',
      sub: 'The Major System is your leveling engine',
      status: 'Active',
      pct: tier2Pct,
      modes: [
        {
          glyph: 'N',
          name: 'Numbers · Major System',
          meta: 'Lesson → memorize → recall',
          tag: 'PLAY',
          accentIcon: true,
          onPress: () => router.push('/numbers'),
        },
        {
          glyph: 'R',
          name: 'Review · 00–99 images',
          meta: dueCount > 0 ? `${dueCount} images due now` : 'all caught up',
          tag: 'DUE',
          onPress: () => router.navigate('/review'),
        },
        {
          glyph: 'C',
          name: 'Cards · reuse 52 images',
          meta: 'Unlocks after the deck of 100',
          locked: true,
          onPress: onLocked,
        },
      ],
    },
    {
      num: '3',
      label: 'Competition',
      sub: 'Memory League-style timed speed rounds',
      status: 'Preview',
      statusMuted: true,
      pct: 22,
      modes: [
        { glyph: 'S', name: 'Speed rounds', meta: 'Levels vs. world-record pace', tag: 'BETA', onPress: () => router.push('/numbers') },
        { glyph: 'H', name: 'Head-to-head', meta: 'Live duels — on the roadmap', locked: true, onPress: onLocked },
      ],
    },
  ];

  return (
    <Screen contentStyle={{ paddingHorizontal: 20 }}>
      {/* header */}
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginTop: 6, marginBottom: 18 }}>
        <View>
          <T s={13} w={500} c={colors.ink3} ls={0.2}>
            {greetingFor()}
          </T>
          <T s={25} w={800} ls={-0.6} style={{ marginTop: 2 }}>
            Atlas
          </T>
        </View>
        <Pill>
          <Flame size={15} color={colors.gold} />
          <T mono w={700} s={14}>
            {streak}
          </T>
        </Pill>
      </View>

      {/* level / xp */}
      <Card style={{ padding: 16, marginBottom: 18 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 11 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <View style={{ width: 34, height: 34, borderRadius: radii.md, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' }}>
              <T mono w={700} s={15} c="#fff">
                {level}
              </T>
            </View>
            <View>
              <T s={15} w={700} ls={-0.2}>
                Level {level}
              </T>
              <T s={12} c={colors.ink3}>
                {rank}
              </T>
            </View>
          </View>
          <T mono s={12} w={700} c={colors.ink2}>
            {xpInto(xp)}/{XP_PER_LEVEL} XP
          </T>
        </View>
        <ProgressBar pct={xpPct(xp)} />
      </Card>

      {/* continue / resume */}
      <Pressable onPress={() => router.push('/numbers')} style={{ backgroundColor: colors.ink, borderRadius: radii.xxl, padding: 18, marginBottom: 22, overflow: 'hidden' }}>
        <View style={{ position: 'absolute', right: -26, top: -26, width: 120, height: 120, borderRadius: 60, backgroundColor: 'rgba(63,111,84,0.22)' }} />
        <T s={11} w={600} ls={1.4} c="rgba(251,249,244,0.55)" style={{ textTransform: 'uppercase' }}>
          Pick up where you left off
        </T>
        <T s={19} w={700} ls={-0.3} c={colors.onInk} style={{ marginTop: 7, marginBottom: 3 }}>
          The Major System
        </T>
        <T s={13} c="rgba(251,249,244,0.62)" style={{ marginBottom: 14 }}>
          {pegs} of 100 number-images learned
        </T>
        <View style={{ flexDirection: 'row', alignSelf: 'flex-start', alignItems: 'center', gap: 8, backgroundColor: colors.accent, paddingVertical: 9, paddingHorizontal: 15, borderRadius: radii.md }}>
          <T s={13.5} w={700} c="#fff">
            Continue training
          </T>
          <ArrowRight size={15} color="#fff" strokeWidth={2.2} />
        </View>
      </Pressable>

      {/* tier spine */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 13 }}>
        <T s={13} w={700} ls={0.3} c={colors.ink2} style={{ textTransform: 'uppercase' }}>
          Your path
        </T>
        <T mono s={12} c={colors.ink3}>
          3 tiers
        </T>
      </View>

      <View style={{ gap: 14 }}>
        {tiers.map((t, i) => (
          <TierCard key={t.num} tier={t} index={i} />
        ))}
      </View>
    </Screen>
  );
}
