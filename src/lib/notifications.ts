/**
 * Local notification helpers for the daily training reminder.
 * Local-only (no push). No-ops gracefully on web or when permission is denied.
 */
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

const REMINDER_HOUR = 19; // 7pm local
const REMINDER_MINUTE = 0;

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

/** Schedule (or reschedule) the daily reminder. Returns true if scheduled. */
export async function enableReminders(): Promise<boolean> {
  if (Platform.OS === 'web') return false;
  try {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') return false;
    await Notifications.cancelAllScheduledNotificationsAsync();
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Time to train your memory',
        body: 'A few number-images are waiting — keep your streak alive.',
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: REMINDER_HOUR,
        minute: REMINDER_MINUTE,
      },
    });
    return true;
  } catch {
    return false;
  }
}

export async function disableReminders(): Promise<void> {
  if (Platform.OS === 'web') return;
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch {
    // ignore
  }
}
