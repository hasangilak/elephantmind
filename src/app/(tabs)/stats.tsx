import React from 'react';
import { View } from 'react-native';

import { PageHeader, Screen } from '@/components/layout';
import { Card, ProgressBar, T } from '@/components/ui';
import { fmtTime } from '@/engine/digits';
import { levelForXp, rankForLevel, xpPct } from '@/engine/leveling';
import { formatWhen, pegsLearned, useProgress, weekdayIndex } from '@/state/store';
import { colors, radii } from '@/theme/tokens';

const WEEK_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

export default function StatsScreen() {
  const xp = useProgress((s) => s.xp);
  const streak = useProgress((s) => s.streak);
  const srCards = useProgress((s) => s.srCards);
  const numbersBest = useProgress((s) => s.numbersBest);
  const palaceBest = useProgress((s) => s.palaceBest);
  const imagesBest = useProgress((s) => s.imagesBest);
  const cardsBest = useProgress((s) => s.cardsBest);
  const recent = useProgress((s) => s.recent);
  const week = useProgress((s) => s.week);

  const level = levelForXp(xp);
  const pegs = pegsLearned(srCards);
  const todayIdx = weekdayIndex();
  const maxBar = Math.max(1, ...week);

  const disciplines = [
    {
      name: 'Numbers',
      best: numbersBest ? `${numbersBest.digits} digits` : '—',
      sub: numbersBest ? `best · ${fmtTime(numbersBest.timeSec)}` : 'not played yet',
      pct: numbersBest ? Math.min(100, Math.round((numbersBest.digits / 60) * 100)) : 0,
      locked: false,
    },
    {
      name: 'Words · Palace',
      best: palaceBest ? `${palaceBest.words} / 12` : '—',
      sub: palaceBest ? `best · ${fmtTime(palaceBest.timeSec)}` : 'not played yet',
      pct: palaceBest ? Math.round((palaceBest.words / 12) * 100) : 0,
      locked: false,
    },
    {
      name: 'Images',
      best: imagesBest ? `${imagesBest.correct} images` : '—',
      sub: imagesBest ? `best · ${fmtTime(imagesBest.timeSec)}` : 'not played yet',
      pct: imagesBest ? Math.min(100, Math.round((imagesBest.correct / 18) * 100)) : 0,
      locked: false,
    },
    {
      name: 'Cards',
      best: cardsBest ? `${cardsBest.correct} cards` : '—',
      sub: cardsBest ? `best · ${fmtTime(cardsBest.timeSec)}` : 'not played yet',
      pct: cardsBest ? Math.min(100, Math.round((cardsBest.correct / 52) * 100)) : 0,
      locked: false,
    },
  ];

  return (
    <Screen>
      <PageHeader eyebrow="Your progress" title="Stats" />

      {/* top row: level + streak/xp */}
      <View style={{ flexDirection: 'row', gap: 11, marginBottom: 16 }}>
        <View style={{ flex: 1, backgroundColor: colors.ink, borderRadius: 18, padding: 16 }}>
          <T mono w={700} s={28} c={colors.onInk} style={{ lineHeight: 28 }}>
            {level}
          </T>
          <T s={11.5} c="rgba(251,249,244,0.6)" style={{ marginTop: 4 }}>
            {rankForLevel(level)}
          </T>
          <View style={{ height: 6, backgroundColor: 'rgba(251,249,244,0.15)', borderRadius: radii.pill, overflow: 'hidden', marginTop: 10 }}>
            <View style={{ height: '100%', backgroundColor: colors.accent, borderRadius: radii.pill, width: `${xpPct(xp)}%` }} />
          </View>
        </View>
        <View style={{ flex: 1, gap: 11 }}>
          <Card style={{ flex: 1, paddingVertical: 12, paddingHorizontal: 14, borderRadius: radii.xl }}>
            <T mono w={700} s={20} c={colors.gold}>
              {streak}🔥
            </T>
            <T s={11} c={colors.ink3}>
              day streak
            </T>
          </Card>
          <Card style={{ flex: 1, paddingVertical: 12, paddingHorizontal: 14, borderRadius: radii.xl }}>
            <T mono w={700} s={20}>
              {xp}
            </T>
            <T s={11} c={colors.ink3}>
              total XP
            </T>
          </Card>
        </View>
      </View>

      {/* major system mastery */}
      <Card style={{ padding: 16, marginBottom: 16, borderRadius: 18 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <T s={14} w={700}>
            Major System mastery
          </T>
          <T mono s={13} w={700} c={colors.accent}>
            {pegs}/100
          </T>
        </View>
        <ProgressBar pct={Math.round((pegs / 100) * 100)} height={9} />
        <T s={11.5} c={colors.ink3} style={{ marginTop: 8 }}>
          {100 - pegs} number-images left to unlock the full deck → Cards.
        </T>
      </Card>

      {/* weekly activity */}
      <Card style={{ padding: 16, marginBottom: 16, borderRadius: 18 }}>
        <T s={14} w={700} style={{ marginBottom: 12 }}>
          This week
        </T>
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 8, height: 74 }}>
          {week.map((v, i) => (
            <View key={i} style={{ flex: 1, alignItems: 'center', gap: 6, height: '100%', justifyContent: 'flex-end' }}>
              <View
                style={{
                  width: '100%',
                  borderTopLeftRadius: 6,
                  borderTopRightRadius: 6,
                  backgroundColor: i === todayIdx ? colors.accent : '#bcd0c2',
                  height: `${Math.max(8, Math.round((v / maxBar) * 100))}%`,
                }}
              />
              <T s={10} w={600} c={colors.ink3}>
                {WEEK_LABELS[i]}
              </T>
            </View>
          ))}
        </View>
      </Card>

      {/* disciplines */}
      <T s={11} w={700} ls={0.8} c={colors.ink3} style={{ marginBottom: 9 }}>
        DISCIPLINE BESTS
      </T>
      <View style={{ gap: 9, marginBottom: 16 }}>
        {disciplines.map((d) => (
          <Card key={d.name} style={{ paddingVertical: 13, paddingHorizontal: 15, borderRadius: radii.lg }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <T s={14.5} w={700} c={d.locked ? colors.ink3 : colors.ink}>
                {d.name}
              </T>
              <T mono s={12.5} w={700} c={colors.ink2}>
                {d.best}
              </T>
            </View>
            <ProgressBar pct={d.pct} height={6} fill={d.locked ? colors.ink3 : colors.accent} />
            <T s={11} c={colors.ink3} style={{ marginTop: 6 }}>
              {d.sub}
            </T>
          </Card>
        ))}
      </View>

      {/* recent */}
      <T s={11} w={700} ls={0.8} c={colors.ink3} style={{ marginBottom: 9 }}>
        RECENT SESSIONS
      </T>
      <Card style={{ overflow: 'hidden', borderRadius: radii.xl }}>
        {recent.map((r, i) => (
          <View
            key={`${r.ts}-${i}`}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 13, paddingHorizontal: 15, borderBottomWidth: i < recent.length - 1 ? 1 : 0, borderBottomColor: colors.line }}
          >
            <View style={{ flex: 1 }}>
              <T s={14} w={600}>
                {r.mode}
              </T>
              <T s={11.5} c={colors.ink3}>
                {r.score} · {formatWhen(r.ts)}
              </T>
            </View>
            <T mono s={13} w={700} c={colors.accent}>
              +{r.xp}
            </T>
          </View>
        ))}
      </Card>
    </Screen>
  );
}
