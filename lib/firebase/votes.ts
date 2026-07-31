import { getFunctions, httpsCallable } from 'firebase/functions';

import { app } from './config';
import type { PollVote } from '@/types/drift';

export async function castVote(driftId: string, vote: PollVote): Promise<void> {
  await httpsCallable<{ driftId: string; vote: PollVote }, { ok: boolean }>(getFunctions(app), 'castVote')({ driftId, vote });
}
