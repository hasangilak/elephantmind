import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Close } from '@/components/Icon';
import { AppBar, T } from '@/components/ui';
import { MIN_PALACE_ROOMS } from '@/data/content';
import { useProgress } from '@/state/store';
import { colors, radii } from '@/theme/tokens';

export default function PalaceEditScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const palace = useProgress((s) => s.palaces.find((p) => p.id === id));
  const updatePalace = useProgress((s) => s.updatePalace);

  if (!palace) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.paper, paddingTop: insets.top }}>
        <AppBar title="Edit palace" onClose={() => router.back()} />
      </View>
    );
  }

  const loci = palace.loci;
  const setName = (name: string) => updatePalace(palace.id, { name });
  const setLocus = (i: number, v: string) => {
    const l = [...loci];
    l[i] = v;
    updatePalace(palace.id, { loci: l });
  };
  const addRoom = () => updatePalace(palace.id, { loci: [...loci, ''] });
  const removeRoom = (i: number) => updatePalace(palace.id, { loci: loci.filter((_, k) => k !== i) });
  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= loci.length) return;
    const l = [...loci];
    [l[i], l[j]] = [l[j], l[i]];
    updatePalace(palace.id, { loci: l });
  };

  const ready = loci.filter((x) => x.trim()).length >= MIN_PALACE_ROOMS;

  return (
    <View style={{ flex: 1, backgroundColor: colors.paper, paddingTop: insets.top }}>
      <AppBar
        title="Edit palace"
        subtitle={ready ? 'ready to walk' : `needs ${MIN_PALACE_ROOMS}+ rooms`}
        onClose={() => router.back()}
      />
      <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 32 }}>
        <T s={11} w={700} ls={0.8} c={colors.ink3} style={{ marginBottom: 9 }}>
          NAME
        </T>
        <TextInput value={palace.name} onChangeText={setName} placeholder="e.g. My apartment" placeholderTextColor={colors.ink3} style={inputStyle} />

        <View style={{ flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', marginTop: 22, marginBottom: 6 }}>
          <T s={11} w={700} ls={0.8} c={colors.ink3}>
            ROOMS · IN ORDER
          </T>
          <T s={11} c={colors.ink3}>{loci.length}</T>
        </View>
        <T s={12} c={colors.ink3} style={{ lineHeight: 17, marginBottom: 12 }}>
          List distinct spots along a route you know — you'll walk them in this exact order.
        </T>

        <View style={{ gap: 8 }}>
          {loci.map((locus, i) => (
            <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <View style={{ width: 24, height: 24, borderRadius: 7, backgroundColor: colors.accentSoft, alignItems: 'center', justifyContent: 'center' }}>
                <T mono w={700} s={11} c={colors.accentDeep}>
                  {i + 1}
                </T>
              </View>
              <TextInput value={locus} onChangeText={(v) => setLocus(i, v)} placeholder="room…" placeholderTextColor={colors.ink3} style={[inputStyle, { flex: 1 }]} />
              <Pressable onPress={() => move(i, -1)} style={iconBtn} hitSlop={4}>
                <T s={16} w={700} c={colors.ink3}>↑</T>
              </Pressable>
              <Pressable onPress={() => move(i, 1)} style={iconBtn} hitSlop={4}>
                <T s={16} w={700} c={colors.ink3}>↓</T>
              </Pressable>
              <Pressable onPress={() => removeRoom(i)} style={iconBtn} hitSlop={4}>
                <Close size={16} color={colors.err} strokeWidth={2} />
              </Pressable>
            </View>
          ))}
        </View>

        <Pressable onPress={addRoom} style={{ marginTop: 12, height: 48, borderRadius: radii.lg, borderWidth: 1.5, borderColor: colors.line, borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center' }}>
          <T s={14} w={700} c={colors.ink2}>
            + Add room
          </T>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const inputStyle = {
  borderWidth: 1.5,
  borderColor: colors.line,
  backgroundColor: colors.card,
  borderRadius: radii.md,
  paddingVertical: 11,
  paddingHorizontal: 14,
  fontSize: 15,
  color: colors.ink,
};
const iconBtn = {
  width: 34,
  height: 34,
  borderRadius: radii.md,
  backgroundColor: colors.card,
  borderWidth: 1,
  borderColor: colors.line,
  alignItems: 'center' as const,
  justifyContent: 'center' as const,
};
