import { useCallback, useMemo, useState } from 'react';
import * as Haptics from 'expo-haptics';

import { castVote } from '@/lib/firebase/votes';
import { useAuthStore } from '@/stores/authStore';
import type { Drift, DriftVote } from '@/types/drift';
import { isExpired } from '@/utils/countdown';

function messageFromError(error: unknown): string {
  return error instanceof Error ? error.message : 'Vote failed.';
}

export function useVote(drift: Drift | null) {
  const uid = useAuthStore((state) => state.firebaseUser?.uid ?? null);
  const [loadingVote, setLoadingVote] = useState<DriftVote | null>(null);
  const [error, setError] = useState<string | null>(null);

  const currentVote = drift && uid ? drift.voters[uid] ?? null : null;

  const canVote = useMemo(() => {
    if (!drift || !uid) {
      return false;
    }

    return drift.status === 'active' && !isExpired(drift.expiresAt) && drift.authorUid !== uid && !drift.voters[uid];
  }, [drift, uid]);

  const vote = useCallback(
    async (nextVote: DriftVote) => {
      if (!drift || !uid || !canVote) {
        return;
      }

      setLoadingVote(nextVote);
      setError(null);
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      try {
        await castVote(drift.id, uid, nextVote);
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch (nextError) {
        setError(messageFromError(nextError));
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      } finally {
        setLoadingVote(null);
      }
    },
    [canVote, drift, uid],
  );

  return {
    canVote,
    currentVote,
    loadingVote,
    error,
    vote,
  };
}
