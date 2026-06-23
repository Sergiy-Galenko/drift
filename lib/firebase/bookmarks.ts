import {
  deleteDoc,
  doc,
  getDoc,
  increment,
  onSnapshot,
  serverTimestamp,
  setDoc,
  updateDoc,
  type Unsubscribe,
  type WithFieldValue,
} from 'firebase/firestore';

import { db } from './config';
import type { BookmarkDoc } from '@/types/drift';

function bookmarkRef(uid: string, driftId: string) {
  return doc(db, 'bookmarks', uid, 'items', driftId);
}

function driftRef(driftId: string) {
  return doc(db, 'drifts', driftId);
}

export function subscribeBookmark(uid: string, driftId: string, onData: (saved: boolean) => void): Unsubscribe {
  return onSnapshot(bookmarkRef(uid, driftId), (snapshot) => onData(snapshot.exists()));
}

export async function isBookmarked(uid: string, driftId: string): Promise<boolean> {
  const snapshot = await getDoc(bookmarkRef(uid, driftId));
  return snapshot.exists();
}

export async function toggleBookmark(uid: string, driftId: string, nextSaved: boolean): Promise<void> {
  if (nextSaved) {
    const bookmark: WithFieldValue<BookmarkDoc> = { driftId, savedAt: serverTimestamp() };
    await setDoc(bookmarkRef(uid, driftId), bookmark);
    await updateDoc(driftRef(driftId), { bookmarkCount: increment(1) });
    return;
  }

  await deleteDoc(bookmarkRef(uid, driftId));
  await updateDoc(driftRef(driftId), { bookmarkCount: increment(-1) });
}
