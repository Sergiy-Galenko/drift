import { createContext, createElement, useCallback, useContext, useEffect, useMemo, useState, type PropsWithChildren } from 'react';
import { InteractionManager } from 'react-native';

import { markNotificationRead, subscribeNotifications } from '@/lib/firebase/notifications';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';
import type { NotificationItem } from '@/types/notification';
import { firebaseErrorMessage } from '@/utils/formatters';
import { logger } from '@/utils/logger';

export function useNotifications() {
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const uid = useAuthStore((state) => state.firebaseUser?.uid);
  const pushToast = useUIStore((state) => state.pushToast);

  useEffect(() => {
    if (!uid) {
      setItems([]);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);
    let active = true;
    let unsubscribe: (() => void) | undefined;
    const task = InteractionManager.runAfterInteractions(() => {
      if (!active) {
        return;
      }

      unsubscribe = subscribeNotifications(
        uid,
        (notifications) => {
          setItems(notifications);
          setLoading(false);
          setError(null);
        },
        (message) => {
          logger.error('Notifications subscription failed', { message });
          pushToast({ title: 'Activity unavailable', message: firebaseErrorMessage(message), tone: 'danger' });
          setLoading(false);
          setError(message);
        },
      );
    });

    return () => {
      active = false;
      task.cancel();
      unsubscribe?.();
    };
  }, [pushToast, uid]);

  const unreadCount = useMemo(() => items.filter((item) => !item.isRead).length, [items]);

  const markRead = useCallback(
    async (itemId: string) => {
      if (!uid) return;
      try {
        await markNotificationRead(uid, itemId);
      } catch (error) {
        logger.warn('Notification mark read failed', { error: String(error) });
      }
    },
    [uid],
  );

  return { items, unreadCount, loading, error, markRead };
}

type NotificationsContextValue = ReturnType<typeof useNotifications>;

const NotificationsContext = createContext<NotificationsContextValue | null>(null);

export function NotificationsProvider({ children }: PropsWithChildren) {
  const { items, unreadCount, loading, error, markRead } = useNotifications();
  const value = useMemo(
    () => ({ items, unreadCount, loading, error, markRead }),
    [error, items, loading, markRead, unreadCount],
  );

  return createElement(NotificationsContext.Provider, { value }, children);
}

export function useNotificationsContext(): NotificationsContextValue {
  const notifications = useContext(NotificationsContext);

  if (!notifications) {
    throw new Error('useNotificationsContext must be used within NotificationsProvider');
  }

  return notifications;
}
