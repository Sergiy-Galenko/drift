import { useEffect, useRef, useState } from 'react';

import { incrementDriftView, settleExpiredDriftIfAuthor, subscribeDrift } from '@/lib/firebase/drifts';
import { useAuthStore } from '@/stores/authStore';
import { useFeedStore } from '@/stores/feedStore';
import { useUIStore } from '@/stores/uiStore';
import type { Drift } from '@/types/drift';
import { firebaseErrorMessage } from '@/utils/formatters';
import { logger } from '@/utils/logger';

export function useDrift(driftId: string | undefined) {
  const [drift, setDrift] = useState<Drift | null>(null);
  const [loading, setLoading] = useState(true);
  const uid = useAuthStore((state) => state.firebaseUser?.uid);
  const upsertDrift = useFeedStore((state) => state.upsertDrift);
  const pushToast = useUIStore((state) => state.pushToast);
  const viewedDriftIds = useRef(new Set<string>());
  const settlingDriftIds = useRef(new Set<string>());

  useEffect(() => {
    if (!driftId) {
      setDrift(null);
      setLoading(false);
      return;
    }

    setDrift(null);
    setLoading(true);
    if (!viewedDriftIds.current.has(driftId)) {
      viewedDriftIds.current.add(driftId);
      void incrementDriftView(driftId).catch((error: unknown) => {
        logger.warn('View increment failed', { error: String(error) });
      });
    }

    const unsubscribe = subscribeDrift(
      driftId,
      (item) => {
        setDrift(item);
        if (item) {
          upsertDrift(item);
          if (uid && !settlingDriftIds.current.has(item.id)) {
            settlingDriftIds.current.add(item.id);
            void settleExpiredDriftIfAuthor(item, uid).catch((error: unknown) => {
              logger.warn('Drift settlement failed', { error: String(error) });
            }).finally(() => {
              settlingDriftIds.current.delete(item.id);
            });
          }
        }
        setLoading(false);
      },
      (message) => {
        logger.error('Drift subscription failed', { message });
        pushToast({ title: 'Drift unavailable', message: firebaseErrorMessage(message), tone: 'danger' });
        setLoading(false);
      },
    );

    return unsubscribe;
  }, [driftId, pushToast, uid, upsertDrift]);

  return { drift, loading };
}
