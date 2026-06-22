import {
  increment,
  runTransaction,
  type FieldValue,
} from 'firebase/firestore';
import { doc } from 'firebase/firestore';

import { getDb, isMockBackend } from '@/lib/firebase/config';
import { mockCastVote } from '@/lib/mock/backend';
import type { DriftVote, FirestoreDrift } from '@/types/drift';

export async function castVote(driftId: string, uid: string, vote: DriftVote): Promise<void> {
  if (isMockBackend) {
    await mockCastVote(driftId, uid, vote);
    return;
  }

  await runTransaction(getDb(), async (transaction) => {
    const driftRef = doc(getDb(), 'drifts', driftId);
    const userRef = doc(getDb(), 'users', uid);
    const snapshot = await transaction.get(driftRef);

    if (!snapshot.exists()) {
      throw new Error('Drift no longer exists.');
    }

    const drift = snapshot.data() as FirestoreDrift;

    if (drift.status !== 'active') {
      throw new Error('Voting is closed for this drift.');
    }

    if (drift.expiresAt.toMillis() <= Date.now()) {
      throw new Error('Voting window has ended.');
    }

    if (drift.authorUid === uid) {
      throw new Error('Authors cannot vote on their own drift.');
    }

    if (drift.voters[uid]) {
      throw new Error('You already voted on this drift.');
    }

    const voteUpdates: Record<string, DriftVote | FieldValue> = {
      [`voters.${uid}`]: vote,
      [vote === 'yes' ? 'votesYes' : 'votesNo']: increment(1),
    };

    transaction.update(driftRef, voteUpdates);
    transaction.update(userRef, {
      driftsVotedOn: increment(1),
    });
  });
}
