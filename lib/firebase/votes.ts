import { getFunctions, httpsCallable } from 'firebase/functions';

import { app } from './config';
import type { DriftVote } from '@/types/drift';

export async function castVote(driftId: string, uid: string, direction: DriftVote): Promise<void> {
  void uid;
  await httpsCallable<{ driftId: string; direction: DriftVote }, { ok: boolean }>(getFunctions(app), 'castVote')({ driftId, direction });
}
