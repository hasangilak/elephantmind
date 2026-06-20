/**
 * Local notification helpers for the daily training reminder.
 *
 * IMPORTANT: expo-notifications throws on load in Expo Go (SDK 53+) and isn't
 * available on web, so it is NEVER statically imported here — it's lazily
 * `require`d only inside a real/dev build. In Expo Go / web these are no-ops.
 */
import Constants, { ExecutionEnvironment } from 'expo-constants';
import { Platform } from 'react-native';
import type * as ExpoNotifications from 'expo-notifications';

const REMINDER_HOUR = 19; // 7pm local
const REMINDER_MINUTE = 0;

const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

/** Scheduled local reminders require a real/dev build (not Expo Go or web). */
export const remindersAvailable = Platform.OS !== 'web' && !isExpoGo;

let handlerSet = false;

/** Lazy-load expo-notifications so it never executes in Expo Go / web. */
function load(): typeof ExpoNotifications {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const N: typeof ExpoNotifications = require('expo-notifications');
  if (!handlerSet) {
    N.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: false,
        shouldSetBadge: false,
      }),
    });
    handlerSet = true;
  }
  return N;
}

/** Schedule (or reschedule) the daily reminder. Returns true if scheduled. */
export async function enableReminders(): Promise<boolean> {
  if (!remindersAvailable) return false;
  try {
    const N = load();
    const { status } = await N.requestPermissionsAsync();
    if (status !== 'granted') return false;
    await N.cancelAllScheduledNotificationsAsync();
    await N.scheduleNotificationAsync({
      content: {
        title: 'Time to train your memory',
        body: 'A few number-images are waiting — keep your streak alive.',
      },
      trigger: {
        type: N.SchedulableTriggerInputTypes.DAILY,
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
  if (!remindersAvailable) return;
  try {
    const N = load();
    await N.cancelAllScheduledNotificationsAsync();
  } catch {
    // ignore
  }
}
