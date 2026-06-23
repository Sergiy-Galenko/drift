import { useCallback, useEffect, useState } from 'react';

import { subscribeBookmark, toggleBookmark } from '@/lib/firebase/bookmarks';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';
import { firebaseErrorMessage } from '@/utils/formatters';
import { logger } from '@/utils/logger';

export function useBookmark(driftId: string | undefined) {
  const [saved, setSaved] = useState(false);
  const uid = useAuthStore((state) => state.firebaseUser?.uid);
  const pushToast = useUIStore((state) => state.pushToast);

  useEffect(() => {
    if (!uid || !driftId) {
      setSaved(false);
      return;
    }

    return subscribeBookmark(uid, driftId, setSaved);
  }, [driftId, uid]);

  const toggle = useCallback(async () => {
    if (!uid || !driftId) {
      pushToast({ title: 'Not signed in', message: 'Sign in before saving drifts.', tone: 'warning' });
      return;
    }

    const nextSaved = !saved;
    setSaved(nextSaved);
    try {
      await toggleBookmark(uid, driftId, nextSaved);
    } catch (error) {
      setSaved(!nextSaved);
      logger.error('Bookmark failed', { error: String(error) });
      pushToast({ title: 'Save failed', message: firebaseErrorMessage(String(error)), tone: 'danger' });
    }
  }, [driftId, pushToast, saved, uid]);

  return { saved, toggle };
}
