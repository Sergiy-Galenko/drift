import { doc, increment, runTransaction, serverTimestamp } from 'firebase/firestore';

import { db } from './config';
import type { DriftDoc, DriftVote } from '@/types/drift';

function driftRef(driftId: string) {
  return doc(db, 'drifts', driftId);
}

function userRef(uid: string) {
  return doc(db, 'users', uid);
}

export async function castVote(driftId: string, uid: string, direction: DriftVote): Promise<void> {
  await runTransaction(db, async (transaction) => {
    const ref = driftRef(driftId);
    const snapshot = await transaction.get(ref);
    if (!snapshot.exists()) {
      throw new Error('not-found');
    }

    const drift = snapshot.data() as DriftDoc;
    if (drift.status !== 'active') {
      throw new Error('permission-denied');
    }

    const previous = drift.voters[uid];
    const updates: Record<string, string | number | ReturnType<typeof increment>> = {
      [`voters.${uid}`]: direction,
    };

    if (previous !== direction) {
      updates[direction === 'yes' ? 'votesYes' : 'votesNo'] = increment(1);
      if (previous) {
        updates[previous === 'yes' ? 'votesYes' : 'votesNo'] = increment(-1);
      }
    }

    transaction.update(ref, updates);
    transaction.update(userRef(uid), {
      driftsVotedOn: increment(previous ? 0 : 1),
      lastActiveAt: serverTimestamp(),
    });
    transaction.update(userRef(drift.authorUid), {
      totalVotesReceived: increment(previous ? 0 : 1),
    });
  });
}
