import { useCallback, useState } from 'react';

import { castVote } from '@/lib/firebase/votes';
import { useAuthStore } from '@/stores/authStore';
import { useFeedStore } from '@/stores/feedStore';
import { useUIStore } from '@/stores/uiStore';
import type { Drift, PollVote } from '@/types/drift';
import { firebaseErrorMessage } from '@/utils/formatters';
import { impactHeavy } from '@/utils/haptics';
import { logger } from '@/utils/logger';
import { isBinaryPoll } from '@/utils/poll';

export function useVote(drift: Drift | null) {
  const [loadingVote, setLoadingVote] = useState<PollVote | null>(null);
  const uid = useAuthStore((state) => state.firebaseUser?.uid);
  const optimisticVote = useFeedStore((state) => state.optimisticVote);
  const rollbackVote = useFeedStore((state) => state.rollbackVote);
  const commitVote = useFeedStore((state) => state.commitVote);
  const storedVote = useFeedStore((state) => (drift ? state.userVotes[drift.id] : undefined));
  const pushToast = useUIStore((state) => state.pushToast);

  const currentVote = drift && uid ? storedVote ?? drift.voters[uid] ?? null : null;

  const canVote = Boolean(drift && uid && drift.status === 'active' && drift.authorUid !== uid);

  const vote = useCallback(
    async (vote: PollVote) => {
      if (!drift || !uid || !canVote) {
        pushToast({ title: 'Vote unavailable', message: 'You cannot vote on this drift.', tone: 'warning' });
        return;
      }

      const shouldOptimisticallyVote = isBinaryPoll(drift);
      setLoadingVote(vote);
      if (shouldOptimisticallyVote) optimisticVote(drift.id, vote as 'yes' | 'no');
      await impactHeavy();

      try {
        await castVote(drift.id, vote);
        commitVote(drift.id, vote);
      } catch (error) {
        logger.error('Vote failed', { error: String(error) });
        if (shouldOptimisticallyVote) rollbackVote(drift.id);
        pushToast({ title: 'Vote failed', message: firebaseErrorMessage(String(error)), tone: 'danger' });
      } finally {
        setLoadingVote(null);
      }
    },
    [canVote, commitVote, drift, optimisticVote, pushToast, rollbackVote, uid],
  );

  return { currentVote, canVote, loadingVote, voting: loadingVote !== null, vote };
}
