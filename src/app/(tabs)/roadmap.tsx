import React from 'react';
import { View } from 'react-native';

import { PageHeader, Screen } from '@/components/layout';
import { Card, T } from '@/components/ui';
import { ROADMAP_ITEMS, UPGRADE_PATH, type UpgradeState } from '@/data/content';
import { colors, radii } from '@/theme/tokens';

const DOT: Record<UpgradeState, { dot: string; halo: string; badge: string; nameOnInk: string }> = {
  active: { dot: colors.accent, halo: 'rgba(63,111,84,0.25)', badge: 'NOW', nameOnInk: colors.onInk },
  next: { dot: colors.gold, halo: 'rgba(176,127,44,0.22)', badge: 'NEXT', nameOnInk: colors.onInk },
  locked: { dot: colors.ink3, halo: 'rgba(156,148,134,0.16)', badge: 'LATER', nameOnInk: 'rgba(251,249,244,0.5)' },
};

export default function RoadmapScreen() {
  return (
    <Screen>
      <PageHeader eyebrow="What's coming" title="Roadmap" />

      {/* upgrade ladder */}
      <View style={{ backgroundColor: colors.ink, borderRadius: radii.xxl, padding: 18, marginBottom: 20 }}>
        <T s={11} w={600} ls={1.2} c="rgba(251,249,244,0.55)" style={{ marginBottom: 14 }}>
          YOUR ENCODING UPGRADE PATH
        </T>
        {UPGRADE_PATH.map((p) => {
          const d = DOT[p.state];
          return (
            <View key={p.name} style={{ flexDirection: 'row', alignItems: 'center', gap: 13, paddingVertical: 9 }}>
              <View style={{ width: 13, height: 13, borderRadius: 7, backgroundColor: d.dot, borderWidth: 4, borderColor: d.halo }} />
              <View style={{ flex: 1 }}>
                <T s={15} w={700} c={d.nameOnInk}>
                  {p.name}
                </T>
                <T mono s={11.5} c="rgba(251,249,244,0.5)">
                  {p.meta}
                </T>
              </View>
              <T s={10.5} w={700} ls={0.5} c={d.dot}>
                {d.badge}
              </T>
            </View>
          );
        })}
      </View>

      <T s={11} w={700} ls={0.8} c={colors.ink3} style={{ marginBottom: 10 }}>
        PLANNED FEATURES
      </T>
      <View style={{ gap: 11 }}>
        {ROADMAP_ITEMS.map((it) => (
          <Card key={it.title} style={{ paddingVertical: 15, paddingHorizontal: 16, borderRadius: radii.xl }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
              <T s={10} w={700} ls={1} c={colors.accent}>
                {it.tag}
              </T>
              <View style={{ backgroundColor: colors.card2, paddingVertical: 3, paddingHorizontal: 9, borderRadius: radii.pill }}>
                <T s={10} w={700} c={colors.ink3}>
                  PLANNED
                </T>
              </View>
            </View>
            <T s={16} w={700} ls={-0.2} style={{ marginBottom: 4 }}>
              {it.title}
            </T>
            <T s={12.5} c={colors.ink2} style={{ lineHeight: 19 }}>
              {it.body}
            </T>
          </Card>
        ))}
      </View>

      <T s={11.5} c={colors.ink3} style={{ textAlign: 'center', marginTop: 18, lineHeight: 17 }}>
        These are scoped but not built in this prototype.{'\n'}The core loop — Numbers, Palace & Review — is fully playable.
      </T>
    </Screen>
  );
}
