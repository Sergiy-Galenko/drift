import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  type DocumentData,
  type DocumentSnapshot,
  type QueryDocumentSnapshot,
  type Unsubscribe,
  type WithFieldValue,
} from 'firebase/firestore';

import { db } from './config';
import { timestampToDate } from './timestamps';
import type { UserDoc, UserProfile, UserProfileInput, UserSettings } from '@/types/user';
import { calcReputationTier } from '@/utils/reputation';

function usersRef() {
  return collection(db, 'users');
}

function userRef(uid: string) {
  return doc(db, 'users', uid);
}

export function mapUser(snapshot: QueryDocumentSnapshot<DocumentData> | DocumentSnapshot<DocumentData>): UserProfile | null {
  if (!snapshot.exists()) {
    return null;
  }

  const data = snapshot.data({ serverTimestamps: 'estimate' }) as UserDoc;
  const now = new Date();
  const joinedAt = timestampToDate(data.joinedAt, now);

  return {
    ...data,
    joinedAt,
    lastActiveAt: timestampToDate(data.lastActiveAt, joinedAt),
  };
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const snapshot = await getDoc(userRef(uid));
  return mapUser(snapshot);
}

export async function getUserByUsername(username: string): Promise<UserProfile | null> {
  const normalized = username.replace(/^@/, '').toLowerCase();
  const snapshot = await getDocs(query(usersRef(), where('username', '==', normalized), limit(1)));
  return snapshot.docs.length > 0 ? mapUser(snapshot.docs[0]) : null;
}

export function subscribeUserProfile(
  uid: string,
  onData: (profile: UserProfile | null) => void,
  onError: (message: string) => void,
): Unsubscribe {
  return onSnapshot(userRef(uid), (snapshot) => onData(mapUser(snapshot)), (error) => onError(error.code));
}

export async function createUserProfile(uid: string, input: UserProfileInput): Promise<void> {
  const username = input.username.trim().toLowerCase();
  const user: WithFieldValue<UserDoc> = {
    uid,
    username,
    displayName: input.displayName?.trim() || null,
    avatarUrl: input.avatarUrl ?? null,
    bio: input.bio?.trim() || null,
    reputationScore: 50,
    reputationTier: calcReputationTier(50),
    streakCurrent: 0,
    streakBest: 0,
    streakLastDate: null,
    driftsCreated: 0,
    driftsVotedOn: 0,
    driftsExecuted: 0,
    driftsFailed: 0,
    totalVotesReceived: 0,
    followersCount: 0,
    followingCount: 0,
    joinedAt: serverTimestamp(),
    lastActiveAt: serverTimestamp(),
    isAnonymous: input.isAnonymous,
    isVerified: false,
    settings: {
      notificationsEnabled: true,
      anonymousDefault: input.isAnonymous,
      vibrationEnabled: true,
    },
  };

  await setDoc(userRef(uid), user);
}

export async function updateUserProfile(
  uid: string,
  input: Partial<Pick<UserDoc, 'displayName' | 'avatarUrl' | 'bio' | 'username'>>,
): Promise<void> {
  const update: Partial<UserDoc> = {};
  if (input.displayName !== undefined) update.displayName = input.displayName?.trim() || null;
  if (input.avatarUrl !== undefined) update.avatarUrl = input.avatarUrl;
  if (input.bio !== undefined) update.bio = input.bio?.trim() || null;
  if (input.username !== undefined) update.username = input.username.trim().toLowerCase();
  await updateDoc(userRef(uid), { ...update, lastActiveAt: serverTimestamp() });
}

export async function updateUserSettings(uid: string, settings: Partial<UserSettings>): Promise<void> {
  const updates = Object.fromEntries(
    Object.entries(settings).map(([key, value]) => [`settings.${key}`, value]),
  ) as Record<string, boolean>;
  await updateDoc(userRef(uid), { ...updates, lastActiveAt: serverTimestamp() });
}

export async function searchUsers(term: string): Promise<UserProfile[]> {
  const normalized = term.trim().replace(/^@/, '').toLowerCase();
  if (normalized.length === 0) {
    return [];
  }

  const snapshot = await getDocs(
    query(usersRef(), orderBy('username'), where('username', '>=', normalized), where('username', '<=', `${normalized}\uf8ff`), limit(12)),
  );

  return snapshot.docs.map((document) => mapUser(document)).filter((profile): profile is UserProfile => profile !== null);
}
