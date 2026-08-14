import { useEffect, useRef } from 'react';
import { AppState, type AppStateStatus } from 'react-native';

import { setAnalyticsUser, trackEvent } from '@/lib/analytics';
import { useAuthStore } from '@/stores/authStore';

export function useAnalyticsLifecycle(): void {
  const uid = useAuthStore((state) => state.profile?.uid ?? null);
  const username = useAuthStore((state) => state.profile?.username ?? null);
  const appState = useRef<AppStateStatus>(AppState.currentState);
  const openedForUser = useRef<string | null>(null);

  useEffect(() => {
    setAnalyticsUser(uid, username);

    if (uid && openedForUser.current !== uid) {
      openedForUser.current = uid;
      trackEvent('app_opened');
    }

    if (!uid) {
      openedForUser.current = null;
    }
  }, [uid, username]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      const returned = appState.current.match(/inactive|background/) && nextState === 'active';
      appState.current = nextState;

      if (returned && uid) {
        trackEvent('app_returned');
      }
    });

    return () => subscription.remove();
  }, [uid]);
}
