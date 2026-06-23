import { useCallback, useEffect, useState } from 'react';

import { subscribeFollow, toggleFollow } from '@/lib/firebase/follows';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';
import { firebaseErrorMessage } from '@/utils/formatters';
import { logger } from '@/utils/logger';

export function useFollow(targetUid: string | undefined) {
  const [following, setFollowing] = useState(false);
  const uid = useAuthStore((state) => state.firebaseUser?.uid);
  const pushToast = useUIStore((state) => state.pushToast);

  useEffect(() => {
    if (!uid || !targetUid || uid === targetUid) {
      setFollowing(false);
      return;
    }

    return subscribeFollow(uid, targetUid, setFollowing);
  }, [targetUid, uid]);

  const toggle = useCallback(async () => {
    if (!uid || !targetUid) {
      pushToast({ title: 'Not signed in', message: 'Sign in before following people.', tone: 'warning' });
      return;
    }

    const nextFollowing = !following;
    setFollowing(nextFollowing);
    try {
      await toggleFollow(uid, targetUid, nextFollowing);
    } catch (error) {
      setFollowing(!nextFollowing);
      logger.error('Follow failed', { error: String(error) });
      pushToast({ title: 'Follow failed', message: firebaseErrorMessage(String(error)), tone: 'danger' });
    }
  }, [following, pushToast, targetUid, uid]);

  return { following, toggle, canFollow: Boolean(uid && targetUid && uid !== targetUid) };
}
