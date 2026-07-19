import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  type Unsubscribe,
  type WithFieldValue,
} from 'firebase/firestore';

import { db } from './config';
import { getDrift } from './drifts';
import type { BookmarkDoc, Drift } from '@/types/drift';

function bookmarkRef(uid: string, driftId: string) {
  return doc(db, 'bookmarks', uid, 'items', driftId);
}

function bookmarksRef(uid: string) {
  return collection(db, 'bookmarks', uid, 'items');
}

export function subscribeBookmark(uid: string, driftId: string, onData: (saved: boolean) => void): Unsubscribe {
  return onSnapshot(bookmarkRef(uid, driftId), (snapshot) => onData(snapshot.exists()));
}

export function subscribeBookmarkedDrifts(
  uid: string,
  onData: (drifts: Drift[]) => void,
  onError: (message: string) => void,
): Unsubscribe {
  let version = 0;
  return onSnapshot(
    query(bookmarksRef(uid), orderBy('savedAt', 'desc'), limit(30)),
    (snapshot) => {
      const currentVersion = ++version;
      void Promise.all(snapshot.docs.map((item) => getDrift(item.id)))
        .then((drifts) => {
          if (currentVersion === version) {
            onData(drifts.filter((drift): drift is Drift => drift !== null));
          }
        })
        .catch((error: unknown) => {
          if (currentVersion === version) {
            onError(String(error));
          }
        });
    },
    (error) => onError(error.code),
  );
}

export async function isBookmarked(uid: string, driftId: string): Promise<boolean> {
  const snapshot = await getDoc(bookmarkRef(uid, driftId));
  return snapshot.exists();
}

export async function toggleBookmark(uid: string, driftId: string, nextSaved: boolean): Promise<void> {
  if (nextSaved) {
    const bookmark: WithFieldValue<BookmarkDoc> = { driftId, savedAt: serverTimestamp() };
    await setDoc(bookmarkRef(uid, driftId), bookmark);
    return;
  }

  await deleteDoc(bookmarkRef(uid, driftId));
}
