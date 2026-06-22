import { useCallback, useState } from 'react';

import { createDrift } from '@/lib/firebase/drifts';
import { useAuthStore } from '@/stores/authStore';
import type { CreateDriftInput } from '@/types/drift';

function messageFromError(error: unknown): string {
  return error instanceof Error ? error.message : 'Could not create drift.';
}

export function useCreateDrift() {
  const profile = useAuthStore((state) => state.profile);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const launch = useCallback(
    async (input: CreateDriftInput) => {
      if (!profile) {
        throw new Error('Sign in before creating a drift.');
      }

      setLoading(true);
      setError(null);

      try {
        return await createDrift(input, profile);
      } catch (nextError) {
        const message = messageFromError(nextError);
        setError(message);
        throw new Error(message);
      } finally {
        setLoading(false);
      }
    },
    [profile],
  );

  return {
    launch,
    loading,
    error,
  };
}
