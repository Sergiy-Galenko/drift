import {
  Timestamp,
  doc,
  getDoc,
  increment,
  runTransaction,
  updateDoc,
} from 'firebase/firestore';

import { getDb, isMockBackend } from '@/lib/firebase/config';
import { mockCreateUserProfile, mockGetUserProfile, mockIsUsernameAvailable } from '@/lib/mock/backend';
import type { AuthUser } from '@/types/auth';
import type { AppUser, FirestoreUser, UsernameClaim } from '@/types/user';
import { calcReputationOnSuccess } from '@/utils/reputation';

export const usernamePattern = /^[A-Za-z0-9_]{3,20}$/;

function userDocumentRef(uid: string) {
  return doc(getDb(), 'users', uid);
}

function usernameDocumentRef(username: string) {
  return doc(getDb(), 'usernames', normalizeUsername(username));
}

export function normalizeUsername(username: string): string {
  return username.trim().toLowerCase();
}

export function assertValidUsername(username: string): void {
  if (!usernamePattern.test(username.trim())) {
    throw new Error('Use 3-20 letters, numbers, or underscores.');
  }
}

export function toAppUser(record: FirestoreUser): AppUser {
  return {
    ...record,
    joinedAt: record.joinedAt.toDate(),
  };
}

export async function getUserProfile(uid: string): Promise<AppUser | null> {
  if (isMockBackend) {
    return mockGetUserProfile(uid);
  }

  const snapshot = await getDoc(userDocumentRef(uid));

  if (!snapshot.exists()) {
    return null;
  }

  return toAppUser(snapshot.data() as FirestoreUser);
}

export async function isUsernameAvailable(username: string): Promise<boolean> {
  assertValidUsername(username);

  if (isMockBackend) {
    return mockIsUsernameAvailable(username);
  }

  const snapshot = await getDoc(usernameDocumentRef(username));
  return !snapshot.exists();
}

export async function createUserProfile(firebaseUser: AuthUser, username: string): Promise<AppUser> {
  assertValidUsername(username);

  if (isMockBackend) {
    return mockCreateUserProfile(firebaseUser, username);
  }

  const cleanUsername = username.trim();
  const normalized = normalizeUsername(cleanUsername);
  const now = Timestamp.now();

  const userRecord: FirestoreUser = {
    uid: firebaseUser.uid,
    username: cleanUsername,
    avatarUrl: firebaseUser.photoURL,
    reputationScore: 50,
    streakCurrent: 0,
    streakBest: 0,
    driftsCreated: 0,
    driftsVotedOn: 0,
    driftsExecuted: 0,
    joinedAt: now,
    isAnonymous: firebaseUser.isAnonymous,
  };

  await runTransaction(getDb(), async (transaction) => {
    const usernameRef = usernameDocumentRef(normalized);
    const usernameSnapshot = await transaction.get(usernameRef);

    if (usernameSnapshot.exists()) {
      throw new Error('Username is already taken.');
    }

    const claim: UsernameClaim = {
      uid: firebaseUser.uid,
      username: cleanUsername,
      createdAt: now,
    };

    transaction.set(userDocumentRef(firebaseUser.uid), userRecord);
    transaction.set(usernameRef, claim);
  });

  return toAppUser(userRecord);
}

export async function incrementUserCreatedCount(uid: string): Promise<void> {
  if (isMockBackend) {
    return;
  }

  await updateDoc(userDocumentRef(uid), {
    driftsCreated: increment(1),
  });
}

export async function incrementUserVotedCount(uid: string): Promise<void> {
  if (isMockBackend) {
    return;
  }

  await updateDoc(userDocumentRef(uid), {
    driftsVotedOn: increment(1),
  });
}

export async function applyProofSuccess(uid: string): Promise<void> {
  if (isMockBackend) {
    return;
  }

  await runTransaction(getDb(), async (transaction) => {
    const ref = userDocumentRef(uid);
    const snapshot = await transaction.get(ref);

    if (!snapshot.exists()) {
      return;
    }

    const user = snapshot.data() as FirestoreUser;
    transaction.update(ref, {
      reputationScore: calcReputationOnSuccess(user.reputationScore),
      driftsExecuted: increment(1),
      streakCurrent: increment(1),
      streakBest: Math.max(user.streakBest, user.streakCurrent + 1),
    });
  });
}
