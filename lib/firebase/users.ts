import {
  collection,
  documentId,
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

const USER_PROFILE_BATCH_SIZE = 30;
const USER_PROFILE_CACHE_TTL_MS = 5 * 60 * 1000;

type CachedUserProfile = {
  profile: UserProfile | null;
  expiresAt: number;
};

const userProfileCache = new Map<string, CachedUserProfile>();

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
  const profile = mapUser(snapshot);
  userProfileCache.set(uid, { profile, expiresAt: Date.now() + USER_PROFILE_CACHE_TTL_MS });
  return profile;
}

export async function getUserProfiles(uids: readonly string[]): Promise<Map<string, UserProfile | null>> {
  const uniqueUids = Array.from(new Set(uids.filter(Boolean)));
  const profiles = new Map<string, UserProfile | null>();
  const now = Date.now();
  const missingUids: string[] = [];

  for (const uid of uniqueUids) {
    const cached = userProfileCache.get(uid);

    if (cached && cached.expiresAt > now) {
      profiles.set(uid, cached.profile);
    } else {
      missingUids.push(uid);
    }
  }

  if (missingUids.length === 0) {
    return profiles;
  }

  const snapshots = await Promise.all(
    Array.from({ length: Math.ceil(missingUids.length / USER_PROFILE_BATCH_SIZE) }, (_, index) => {
      const batch = missingUids.slice(index * USER_PROFILE_BATCH_SIZE, (index + 1) * USER_PROFILE_BATCH_SIZE);
      return getDocs(query(usersRef(), where(documentId(), 'in', batch)));
    }),
  );
  const fetchedProfiles = new Map<string, UserProfile>();

  for (const snapshot of snapshots) {
    for (const document of snapshot.docs) {
      const profile = mapUser(document);

      if (profile) {
        fetchedProfiles.set(profile.uid, profile);
      }
    }
  }

  const expiresAt = Date.now() + USER_PROFILE_CACHE_TTL_MS;

  for (const uid of missingUids) {
    const profile = fetchedProfiles.get(uid) ?? null;
    profiles.set(uid, profile);
    userProfileCache.set(uid, { profile, expiresAt });
  }

  return profiles;
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
  userProfileCache.delete(uid);
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
  userProfileCache.delete(uid);
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

export async function getDiscoverUsers(limitCount = 12): Promise<UserProfile[]> {
  const snapshot = await getDocs(query(usersRef(), orderBy('followersCount', 'desc'), limit(limitCount)));
  return snapshot.docs.map((document) => mapUser(document)).filter((profile): profile is UserProfile => profile !== null);
}
