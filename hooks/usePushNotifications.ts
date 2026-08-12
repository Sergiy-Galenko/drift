import { useEffect } from 'react';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';

import { updateExpoPushToken } from '@/lib/firebase/users';
import { Colors } from '@/constants/tokens';
import { useAuthStore } from '@/stores/authStore';
import { logger } from '@/utils/logger';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

function easProjectId(): string | undefined {
  const projectId = Constants.easConfig?.projectId ?? Constants.expoConfig?.extra?.eas?.projectId;
  return typeof projectId === 'string' && projectId.length > 0 ? projectId : undefined;
}

export function usePushNotifications(): void {
  const uid = useAuthStore((state) => state.profile?.uid);
  const notificationsEnabled = useAuthStore((state) => state.profile?.settings.notificationsEnabled);
  const savedToken = useAuthStore((state) => state.profile?.expoPushToken);
  const streak = useAuthStore((state) => state.profile?.streakCurrent ?? 0);

  useEffect(() => {
    if (!uid || notificationsEnabled === undefined) {
      return;
    }

    if (!notificationsEnabled) {
      void Notifications.getAllScheduledNotificationsAsync().then((scheduled) => Promise.all(
        scheduled
          .filter((item) => item.content.data?.kind === 'docket-daily')
          .map((item) => Notifications.cancelScheduledNotificationAsync(item.identifier)),
      )).catch(() => undefined);
      if (savedToken) {
        void updateExpoPushToken(uid, null).catch((error: unknown) => {
          logger.warn('Push token removal failed', { error: String(error) });
        });
      }
      return;
    }

    if (Platform.OS === 'web') {
      return;
    }

    let cancelled = false;

    const register = async () => {
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'DRIFT reminders',
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: Colors.ledger,
        });
      }

      const permissions = await Notifications.getPermissionsAsync();
      const status = permissions.status === 'granted'
        ? permissions.status
        : (await Notifications.requestPermissionsAsync()).status;
      const projectId = easProjectId();

      if (status !== 'granted' || !projectId) {
        if (!projectId) {
          logger.warn('Push notifications need an EAS project ID');
        }
        return;
      }

      const token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
      if (!cancelled && token !== savedToken) {
        await updateExpoPushToken(uid, token);
      }

      const scheduled = await Notifications.getAllScheduledNotificationsAsync();
      if (!cancelled && !scheduled.some((item) => item.content.data?.kind === 'docket-daily')) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: 'Docket pending',
            body: streak > 0 ? `Protect your ${streak}-day record.` : 'Review your open cases.',
            data: { kind: 'docket-daily' },
          },
          trigger: { type: Notifications.SchedulableTriggerInputTypes.DAILY, hour: 20, minute: 0 },
        });
      }
    };

    void register().catch((error: unknown) => {
      logger.warn('Push registration failed', { error: String(error) });
    });

    return () => {
      cancelled = true;
    };
  }, [notificationsEnabled, savedToken, streak, uid]);
}
