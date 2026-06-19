/**
 * Thin haptics wrapper that respects the user's `haptics` setting and is a
 * no-op on web. Safe to call from event handlers (reads store imperatively).
 */
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

import { useProgress } from '@/state/store';

function enabled(): boolean {
  return Platform.OS !== 'web' && useProgress.getState().settings.haptics;
}

export function tapKey(): void {
  if (enabled()) Haptics.selectionAsync();
}

export function tapMedium(): void {
  if (enabled()) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
}

export function success(): void {
  if (enabled()) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
}

export function error(): void {
  if (enabled()) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
}
