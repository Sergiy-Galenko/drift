import { useEffect, useState } from 'react';

import { subscribeBookmarkedDrifts } from '@/lib/firebase/bookmarks';
import type { Drift } from '@/types/drift';
import { logger } from '@/utils/logger';

export function useSavedDrifts(uid: string | undefined, enabled: boolean) {
  const [drifts, setDrifts] = useState<Drift[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!uid || !enabled) {
      setDrifts([]);
      setLoading(false);
      setError(null);
      return undefined;
    }

    setLoading(true);
    setError(null);
    return subscribeBookmarkedDrifts(
      uid,
      (items) => {
        setDrifts(items);
        setLoading(false);
      },
      (message) => {
        logger.error('Saved drifts subscription failed', { message });
        setError(message);
        setLoading(false);
      },
    );
  }, [enabled, uid]);

  return { drifts, loading, error };
}
