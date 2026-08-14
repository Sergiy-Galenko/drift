import { doc, onSnapshot, type DocumentData, type Unsubscribe } from 'firebase/firestore';

import { db } from './config';
import type { RetentionProgress, RetentionState } from '@/types/retention';

const emptyProgress = (): RetentionProgress => ({ created: 0, votes: 0, proofs: 0 });

function progress(value: unknown): RetentionProgress {
  const source = value && typeof value === 'object' ? value as Record<string, unknown> : {};
  const count = (key: keyof RetentionProgress) => typeof source[key] === 'number' ? Math.max(0, Math.floor(source[key] as number)) : 0;
  return { created: count('created'), votes: count('votes'), proofs: count('proofs') };
}

function mapRetention(data: DocumentData | undefined): RetentionState {
  return {
    dayKey: typeof data?.dayKey === 'string' ? data.dayKey : '',
    weekKey: typeof data?.weekKey === 'string' ? data.weekKey : '',
    daily: progress(data?.daily),
    weekly: progress(data?.weekly),
  };
}

export function subscribeRetention(
  uid: string,
  onData: (state: RetentionState) => void,
  onError: (message: string) => void,
): Unsubscribe {
  return onSnapshot(
    doc(db, 'retention', uid),
    (snapshot) => onData(snapshot.exists() ? mapRetention(snapshot.data()) : { dayKey: '', weekKey: '', daily: emptyProgress(), weekly: emptyProgress() }),
    (error) => onError(error.code),
  );
}
