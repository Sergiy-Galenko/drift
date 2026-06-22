import { useEffect, useMemo, useState } from 'react';

import { incrementDriftView, settleExpiredDriftIfAuthor, subscribeDrift } from '@/lib/firebase/drifts';
import { useAuthStore } from '@/stores/authStore';
import type { Drift } from '@/types/drift';
import { isProofWindowOpen } from '@/utils/countdown';

const viewedDrifts = new Set<string>();

export function useDrift(driftId?: string) {
  const currentUid = useAuthStore((state) => state.firebaseUser?.uid ?? null);
  const [drift, setDrift] = useState<Drift | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!driftId) {
      return;
    }

    const unsubscribe = subscribeDrift(
      driftId,
      (nextDrift) => {
        setDrift(nextDrift);
        setError(null);
        setLoading(false);

        if (nextDrift && !viewedDrifts.has(nextDrift.id)) {
          viewedDrifts.add(nextDrift.id);
          void incrementDriftView(nextDrift.id).catch(() => undefined);
        }

        if (nextDrift && currentUid) {
          void settleExpiredDriftIfAuthor(nextDrift, currentUid).catch(() => undefined);
        }
      },
      (message) => {
        setError(message);
        setLoading(false);
      },
    );

    return unsubscribe;
  }, [currentUid, driftId]);

  const canUploadProof = useMemo(() => {
    if (!drift || !currentUid) {
      return false;
    }

    return (
      drift.authorUid === currentUid &&
      drift.status === 'decided' &&
      drift.proofUrl === null &&
      isProofWindowOpen(drift.expiresAt)
    );
  }, [currentUid, drift]);

  return {
    drift,
    loading: driftId ? loading : false,
    error: driftId ? error : 'Missing drift id.',
    canUploadProof,
  };
}
