import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  limit,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  where,
  type Unsubscribe,
  type WithFieldValue,
} from 'firebase/firestore';

import { db } from './config';
import { getUserProfiles } from './users';
import type { FollowDoc } from '@/types/drift';
import type { UserProfile } from '@/types/user';

function followId(followerId: string, followingId: string): string {
  return `${followerId}_${followingId}`;
}

function followRef(followerId: string, followingId: string) {
  return doc(db, 'follows', followId(followerId, followingId));
}

export function subscribeFollow(
  followerId: string,
  followingId: string,
  onData: (following: boolean) => void,
): Unsubscribe {
  return onSnapshot(followRef(followerId, followingId), (snapshot) => onData(snapshot.exists()));
}

export async function isFollowing(followerId: string, followingId: string): Promise<boolean> {
  const snapshot = await getDoc(followRef(followerId, followingId));
  return snapshot.exists();
}

export async function toggleFollow(followerId: string, followingId: string, nextFollowing: boolean): Promise<void> {
  if (followerId === followingId) {
    return;
  }

  if (nextFollowing) {
    const follow: WithFieldValue<FollowDoc> = {
      followerId,
      followingId,
      createdAt: serverTimestamp(),
    };
    await setDoc(followRef(followerId, followingId), follow);
    return;
  }

  await deleteDoc(followRef(followerId, followingId));
}

export function subscribeFollowers(
  uid: string,
  onData: (followers: UserProfile[]) => void,
  onError: (message: string) => void,
): Unsubscribe {
  return onSnapshot(
    query(collection(db, 'follows'), where('followingId', '==', uid), limit(80)),
    (snapshot) => {
      const followerIds = snapshot.docs.map((document) => (document.data() as FollowDoc).followerId);

      getUserProfiles(followerIds)
        .then((profilesByUid) =>
          onData(
            followerIds
              .map((followerId) => profilesByUid.get(followerId) ?? null)
              .filter((profile): profile is UserProfile => profile !== null),
          ),
        )
        .catch((error: unknown) => onError(String(error)));
    },
    (error) => onError(error.code),
  );
}

export function subscribeFollowing(
  uid: string,
  onData: (profiles: UserProfile[]) => void,
  onError: (message: string) => void,
): Unsubscribe {
  return onSnapshot(
    query(collection(db, 'follows'), where('followerId', '==', uid), limit(80)),
    (snapshot) => {
      const ids = snapshot.docs.map((document) => (document.data() as FollowDoc).followingId);
      getUserProfiles(ids).then((profiles) => onData(ids.map((id) => profiles.get(id) ?? null).filter((profile): profile is UserProfile => profile !== null))).catch((error: unknown) => onError(String(error)));
    },
    (error) => onError(error.code),
  );
}
