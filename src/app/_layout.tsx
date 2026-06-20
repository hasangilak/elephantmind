import {
  SchibstedGrotesk_400Regular,
  SchibstedGrotesk_500Medium,
  SchibstedGrotesk_600SemiBold,
  SchibstedGrotesk_700Bold,
  SchibstedGrotesk_800ExtraBold,
  useFonts,
} from '@expo-google-fonts/schibsted-grotesk';
import { SpaceMono_400Regular, SpaceMono_700Bold } from '@expo-google-fonts/space-mono';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ToastHost } from '@/components/ui';
import { enableReminders } from '@/lib/notifications';
import { useProgress } from '@/state/store';
import { colors } from '@/theme/tokens';

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    SchibstedGrotesk_400Regular,
    SchibstedGrotesk_500Medium,
    SchibstedGrotesk_600SemiBold,
    SchibstedGrotesk_700Bold,
    SchibstedGrotesk_800ExtraBold,
    SpaceMono_400Regular,
    SpaceMono_700Bold,
  });
  const hydrated = useProgress((s) => s.hydrated);
  const reminders = useProgress((s) => s.settings.reminders);

  // Kick rehydration (zustand persist hydrates async from AsyncStorage).
  useEffect(() => {
    useProgress.persist.rehydrate();
  }, []);

  // Keep the scheduled daily reminder in sync with the setting.
  useEffect(() => {
    if (hydrated && reminders) void enableReminders();
  }, [hydrated, reminders]);

  if (!fontsLoaded || !hydrated) {
    return <View style={{ flex: 1, backgroundColor: colors.paper }} />;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.paper }}>
      <SafeAreaProvider>
        <StatusBar style="dark" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colors.paper },
          }}
        >
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="numbers" options={{ animation: 'slide_from_bottom' }} />
          <Stack.Screen name="numbers-tutorial" options={{ animation: 'slide_from_bottom' }} />
          <Stack.Screen name="palace" options={{ animation: 'slide_from_bottom' }} />
          <Stack.Screen name="palaces" options={{ animation: 'slide_from_bottom' }} />
          <Stack.Screen name="palace-edit" options={{ animation: 'slide_from_bottom' }} />
          <Stack.Screen name="palace-tutorial" options={{ animation: 'slide_from_bottom' }} />
          <Stack.Screen name="images" options={{ animation: 'slide_from_bottom' }} />
          <Stack.Screen name="images-tutorial" options={{ animation: 'slide_from_bottom' }} />
          <Stack.Screen name="cards" options={{ animation: 'slide_from_bottom' }} />
          <Stack.Screen name="cards-tutorial" options={{ animation: 'slide_from_bottom' }} />
          <Stack.Screen name="cards-system" options={{ animation: 'slide_from_bottom' }} />
          <Stack.Screen name="settings" options={{ animation: 'slide_from_bottom' }} />
        </Stack>
        <ToastHost />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
