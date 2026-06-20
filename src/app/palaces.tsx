import { useRouter } from 'expo-router';
import React from 'react';
import { Alert, Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ChevronRight } from '@/components/Icon';
import { AppBar, Card, T } from '@/components/ui';
import { MIN_PALACE_ROOMS } from '@/data/content';
import { useProgress } from '@/state/store';
import { colors, radii } from '@/theme/tokens';

export default function PalacesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const palaces = useProgress((s) => s.palaces);
  const activePalaceId = useProgress((s) => s.activePalaceId);
  const setActivePalace = useProgress((s) => s.setActivePalace);
  const addPalace = useProgress((s) => s.addPalace);
  const deletePalace = useProgress((s) => s.deletePalace);

  const edit = (id: string) => router.push({ pathname: '/palace-edit', params: { id } });

  const onNew = () => {
    const id = addPalace(`Palace ${palaces.length + 1}`);
    edit(id);
  };

  const onDelete = (id: string, name: string) => {
    Alert.alert('Delete palace?', `"${name}" and its rooms will be removed.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deletePalace(id) },
    ]);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.paper, paddingTop: insets.top }}>
      <AppBar title="Memory palaces" subtitle="Pick or build your own" onClose={() => router.back()} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 28 }}>
        <T s={13} c={colors.ink2} style={{ lineHeight: 19, marginBottom: 16 }}>
          A palace is an ordered route of rooms you know by heart. Pick the one you'll walk, or build a new one from a place you know well.
        </T>

        <View style={{ gap: 11 }}>
          {palaces.map((p) => {
            const active = p.id === activePalaceId;
            const rooms = p.loci.filter((l) => l.trim()).length;
            const ready = rooms >= MIN_PALACE_ROOMS;
            return (
              <Card key={p.id} style={{ padding: 14, borderColor: active ? colors.accent : colors.line, borderWidth: 1.5 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <Pressable onPress={() => setActivePalace(p.id)} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}>
                    <View
                      style={{
                        width: 22,
                        height: 22,
                        borderRadius: 11,
                        borderWidth: 2,
                        borderColor: active ? colors.accent : colors.line,
                        backgroundColor: active ? colors.accent : 'transparent',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {active && <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#fff' }} />}
                    </View>
                    <View style={{ flex: 1, minWidth: 0 }}>
                      <T s={16} w={700} ls={-0.2}>
                        {p.name}
                      </T>
                      <T s={12} c={ready ? colors.ink3 : colors.err} style={{ marginTop: 1 }}>
                        {rooms} room{rooms === 1 ? '' : 's'}
                        {ready ? (active ? ' · active' : '') : ` · add ${MIN_PALACE_ROOMS - rooms} more to play`}
                      </T>
                    </View>
                  </Pressable>
                  <Pressable
                    onPress={() => edit(p.id)}
                    style={{ flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 6, paddingHorizontal: 10, borderRadius: radii.md, backgroundColor: colors.card2 }}
                  >
                    <T s={13} w={600} c={colors.ink2}>
                      Edit
                    </T>
                    <ChevronRight size={16} color={colors.ink3} strokeWidth={2} />
                  </Pressable>
                </View>
                {palaces.length > 1 && (
                  <Pressable onPress={() => onDelete(p.id, p.name)} style={{ alignSelf: 'flex-start', marginTop: 10 }}>
                    <T s={12} w={600} c={colors.err}>
                      Delete
                    </T>
                  </Pressable>
                )}
              </Card>
            );
          })}
        </View>

        <Pressable
          onPress={onNew}
          style={{ marginTop: 16, height: 52, borderRadius: radii.xl, borderWidth: 1.5, borderColor: colors.accent, borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center' }}
        >
          <T s={15} w={700} c={colors.accentDeep}>
            + New palace
          </T>
        </Pressable>
      </ScrollView>
    </View>
  );
}
