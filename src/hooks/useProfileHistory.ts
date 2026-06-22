import { useEffect, useState } from 'react';

import { subscribeCreatedDrifts, subscribeVotedDrifts } from '@/lib/firebase/drifts';
import type { Drift } from '@/types/drift';

export function useProfileHistory(uid?: string) {
  const [created, setCreated] = useState<Drift[]>([]);
  const [voted, setVoted] = useState<Drift[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!uid) {
      return;
    }

    const unsubscribeCreated = subscribeCreatedDrifts(
      uid,
      (drifts) => {
        setCreated(drifts);
        setLoading(false);
      },
      (message) => {
        setError(message);
        setLoading(false);
      },
    );

    const unsubscribeVoted = subscribeVotedDrifts(
      uid,
      (drifts) => setVoted(drifts),
      (message) => {
        setError(message);
        setLoading(false);
      },
    );

    return () => {
      unsubscribeCreated();
      unsubscribeVoted();
    };
  }, [uid]);

  return {
    created,
    voted,
    loading: uid ? loading : false,
    error,
  };
}
