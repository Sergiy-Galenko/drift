import { httpsCallable } from 'firebase/functions';

import { trackEvent } from '@/lib/analytics';
import { functions } from './config';
import type { PollVote } from '@/types/drift';

export async function castVote(driftId: string, vote: PollVote): Promise<void> {
  await httpsCallable<{ driftId: string; vote: PollVote }, { ok: boolean }>(functions, 'castVote')({ driftId, vote });
  trackEvent('vote_cast', { poll_type: Array.isArray(vote) ? 'ranking' : vote });
}
