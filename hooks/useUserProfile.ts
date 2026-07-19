import { useEffect, useState } from 'react';

import { getUserByUsername, subscribeUserProfile } from '@/lib/firebase/users';
import { useUIStore } from '@/stores/uiStore';
import type { UserProfile } from '@/types/user';
import { firebaseErrorMessage } from '@/utils/formatters';
import { logger } from '@/utils/logger';

export function useUserProfile(uidOrUsername: string | undefined, mode: 'uid' | 'username' = 'uid') {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const pushToast = useUIStore((state) => state.pushToast);

  useEffect(() => {
    if (!uidOrUsername) {
      setProfile(null);
      setLoading(false);
      return;
    }

    setProfile(null);
    setLoading(true);

    if (mode === 'username') {
      let mounted = true;
      getUserByUsername(uidOrUsername)
        .then((user) => {
          if (mounted) setProfile(user);
        })
        .catch((error: unknown) => {
          logger.error('User lookup failed', { error: String(error) });
          pushToast({ title: 'User unavailable', message: firebaseErrorMessage(String(error)), tone: 'danger' });
        })
        .finally(() => {
          if (mounted) setLoading(false);
        });
      return () => {
        mounted = false;
      };
    }

    const unsubscribe = subscribeUserProfile(
      uidOrUsername,
      (user) => {
        setProfile(user);
        setLoading(false);
      },
      (message) => {
        logger.error('User subscription failed', { message });
        pushToast({ title: 'User unavailable', message: firebaseErrorMessage(message), tone: 'danger' });
        setLoading(false);
      },
    );

    return unsubscribe;
  }, [mode, pushToast, uidOrUsername]);

  return { profile, loading };
}
