import { useRouter } from 'expo-router';
import React from 'react';
import { Alert, Pressable, ScrollView, Switch, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppBar, Card, T } from '@/components/ui';
import { disableReminders, enableReminders, remindersAvailable } from '@/lib/notifications';
import { useProgress, type Settings } from '@/state/store';
import { useUI } from '@/state/ui';
import { colors, radii } from '@/theme/tokens';

interface Row {
  key: keyof Settings;
  title: string;
  desc: string;
}

const PREF_ROWS: Row[] = [
  { key: 'haptics', title: 'Haptics', desc: 'Subtle taps on keys and results.' },
  { key: 'reminders', title: 'Daily reminder', desc: 'A nudge at 7pm to keep your streak.' },
  { key: 'reduceMotion', title: 'Reduce motion', desc: 'Turn off count-ups and large animations.' },
];

export default function SettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const name = useProgress((s) => s.name);
  const setName = useProgress((s) => s.setName);
  const settings = useProgress((s) => s.settings);
  const setSetting = useProgress((s) => s.setSetting);
  const resetProgress = useProgress((s) => s.resetProgress);
  const showToast = useUI((s) => s.showToast);

  const onToggle = async (key: keyof Settings, value: boolean) => {
    setSetting(key, value);
    if (key === 'reminders') {
      if (value) {
        if (!remindersAvailable) {
          setSetting('reminders', false);
          showToast('Reminders need a dev build (not Expo Go)');
          return;
        }
        const ok = await enableReminders();
        if (!ok) {
          setSetting('reminders', false);
          showToast('Enable notifications in system settings');
        }
      } else {
        await disableReminders();
      }
    }
  };

  const onReset = () => {
    Alert.alert(
      'Reset progress?',
      'This clears your XP, streak, spaced-repetition deck and history. Settings are kept. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            resetProgress();
            showToast('Progress reset');
          },
        },
      ],
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.paper, paddingTop: insets.top }}>
      <AppBar title="Settings" onClose={() => router.back()} />
      <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 28 }}>
        <T s={11} w={700} ls={0.8} c={colors.ink3} style={{ marginBottom: 9 }}>
          PROFILE
        </T>
        <Card style={{ borderRadius: radii.xl, marginBottom: 20, padding: 14 }}>
          <T s={12} c={colors.ink3} style={{ marginBottom: 8 }}>
            Your name (shown on Home)
          </T>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Athlete"
            placeholderTextColor={colors.ink3}
            style={{ borderWidth: 1.5, borderColor: colors.line, backgroundColor: colors.card2, borderRadius: radii.md, paddingVertical: 11, paddingHorizontal: 14, fontSize: 15, color: colors.ink }}
          />
        </Card>

        <T s={11} w={700} ls={0.8} c={colors.ink3} style={{ marginBottom: 9 }}>
          PREFERENCES
        </T>
        <Card style={{ overflow: 'hidden', borderRadius: radii.xl, marginBottom: 20 }}>
          {PREF_ROWS.map((row, i) => (
            <View
              key={row.key}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14, paddingHorizontal: 16, borderBottomWidth: i < PREF_ROWS.length - 1 ? 1 : 0, borderBottomColor: colors.line }}
            >
              <View style={{ flex: 1 }}>
                <T s={15} w={600}>
                  {row.title}
                </T>
                <T s={12} c={colors.ink3} style={{ marginTop: 1 }}>
                  {row.desc}
                </T>
              </View>
              <Switch
                value={settings[row.key]}
                onValueChange={(v) => onToggle(row.key, v)}
                trackColor={{ false: colors.card2, true: colors.accent }}
                thumbColor="#fff"
                ios_backgroundColor={colors.card2}
              />
            </View>
          ))}
        </Card>

        <T s={11} w={700} ls={0.8} c={colors.ink3} style={{ marginBottom: 9 }}>
          PROGRESS
        </T>
        <Card style={{ borderRadius: radii.xl, marginBottom: 20 }}>
          <Pressable
            style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14, paddingHorizontal: 16 }}
            onPress={onReset}
          >
            <View style={{ flex: 1 }}>
              <T s={15} w={600} c={colors.err}>
                Reset progress
              </T>
              <T s={12} c={colors.ink3} style={{ marginTop: 1 }}>
                Start over from zero. Settings are kept.
              </T>
            </View>
          </Pressable>
        </Card>

        <T s={12} c={colors.ink3} style={{ textAlign: 'center', lineHeight: 18 }}>
          Elephantam · a memory-training game.{'\n'}Built on the method of loci & the Major System.
        </T>
      </ScrollView>
    </View>
  );
}
