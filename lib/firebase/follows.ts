import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  increment,
  limit,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
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

function userRef(uid: string) {
  return doc(db, 'users', uid);
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
    await updateDoc(userRef(followerId), { followingCount: increment(1) });
    await updateDoc(userRef(followingId), { followersCount: increment(1) });
    return;
  }

  await deleteDoc(followRef(followerId, followingId));
  await updateDoc(userRef(followerId), { followingCount: increment(-1) });
  await updateDoc(userRef(followingId), { followersCount: increment(-1) });
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
