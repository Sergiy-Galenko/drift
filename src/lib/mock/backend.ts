import type { CategoryFilter } from '@/constants/categories';
import type { AuthUser } from '@/types/auth';
import type { CreateDriftInput, Drift, DriftVote } from '@/types/drift';
import type { AppUser } from '@/types/user';
import { isExpired } from '@/utils/countdown';
import { calcReputationOnSuccess } from '@/utils/reputation';

type DriftListener = (drifts: Drift[]) => void;
type SingleDriftListener = (drift: Drift | null) => void;
type AuthListener = (user: AuthUser | null) => void;

const now = Date.now();

let currentAuthUser: AuthUser | null = null;

const authListeners = new Set<AuthListener>();
const feedListeners = new Set<{
  category: CategoryFilter;
  limitCount: number;
  callback: DriftListener;
}>();
const driftListeners = new Set<{
  driftId: string;
  callback: SingleDriftListener;
}>();
const createdListeners = new Set<{
  uid: string;
  callback: DriftListener;
}>();
const votedListeners = new Set<{
  uid: string;
  callback: DriftListener;
}>();

const users = new Map<string, AppUser>();
const usernameClaims = new Map<string, string>();

let drifts: Drift[] = [
  {
    id: 'mock-life-lisbon',
    authorUid: 'mock-author-1',
    authorUsername: 'mara',
    text: 'Quit my job and move to Lisbon for 3 months?',
    stake: 'I book flights tonight. No take-backs.',
    votesYes: 24,
    votesNo: 11,
    voters: {},
    status: 'active',
    result: null,
    createdAt: new Date(now - 35 * 60 * 1000),
    expiresAt: new Date(now + 23 * 60 * 60 * 1000),
    proofUrl: null,
    proofUploadedAt: null,
    category: 'life',
    isAnonymous: false,
    viewCount: 204,
  },
  {
    id: 'mock-love-message',
    authorUid: 'mock-author-2',
    authorUsername: 'ghost',
    text: 'Tell my friend I caught feelings before Friday?',
    stake: 'I send the message before midnight.',
    votesYes: 18,
    votesNo: 21,
    voters: {},
    status: 'active',
    result: null,
    createdAt: new Date(now - 58 * 60 * 1000),
    expiresAt: new Date(now + 54 * 60 * 1000),
    proofUrl: null,
    proofUploadedAt: null,
    category: 'love',
    isAnonymous: true,
    viewCount: 98,
  },
  {
    id: 'mock-career-pitch',
    authorUid: 'mock-author-3',
    authorUsername: 'devon',
    text: 'Pitch my weird product idea to the investor group?',
    stake: 'I send the deck and book the call.',
    votesYes: 42,
    votesNo: 8,
    voters: {},
    status: 'active',
    result: null,
    createdAt: new Date(now - 2 * 60 * 60 * 1000),
    expiresAt: new Date(now + 7 * 60 * 60 * 1000),
    proofUrl: null,
    proofUploadedAt: null,
    category: 'career',
    isAnonymous: false,
    viewCount: 311,
  },
];

function defaultProfileFor(user: AuthUser): AppUser {
  return {
    uid: user.uid,
    username: user.isAnonymous ? 'guest' : user.displayName?.replace(/\W+/g, '_').toLowerCase() || 'guest',
    avatarUrl: user.photoURL,
    reputationScore: 50,
    streakCurrent: 0,
    streakBest: 0,
    driftsCreated: 0,
    driftsVotedOn: 0,
    driftsExecuted: 0,
    joinedAt: new Date(),
    isAnonymous: user.isAnonymous,
  };
}

function normalizedUsername(username: string): string {
  return username.trim().toLowerCase();
}

function notifyAuth(): void {
  authListeners.forEach((callback) => callback(currentAuthUser));
}

function activeFeed(category: CategoryFilter, limitCount: number): Drift[] {
  const filtered = drifts
    .filter((drift) => drift.status === 'active')
    .filter((drift) => category === 'all' || drift.category === category)
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  return filtered.slice(0, limitCount);
}

function notifyDrifts(): void {
  feedListeners.forEach((listener) => listener.callback(activeFeed(listener.category, listener.limitCount)));
  driftListeners.forEach((listener) => {
    listener.callback(drifts.find((drift) => drift.id === listener.driftId) ?? null);
  });
  createdListeners.forEach((listener) => {
    listener.callback(drifts.filter((drift) => drift.authorUid === listener.uid));
  });
  votedListeners.forEach((listener) => {
    listener.callback(drifts.filter((drift) => drift.voters[listener.uid]));
  });
}

function currentProfile(): AppUser | null {
  return currentAuthUser ? users.get(currentAuthUser.uid) ?? null : null;
}

export function subscribeMockAuthState(callback: AuthListener): () => void {
  authListeners.add(callback);
  callback(currentAuthUser);

  return () => {
    authListeners.delete(callback);
  };
}

export async function mockSignInAsGuest(): Promise<AuthUser> {
  currentAuthUser = {
    uid: 'mock-user',
    isAnonymous: true,
    photoURL: null,
    displayName: 'Guest',
  };

  if (!users.has(currentAuthUser.uid)) {
    const profile = defaultProfileFor(currentAuthUser);
    users.set(profile.uid, profile);
    usernameClaims.set(normalizedUsername(profile.username), profile.uid);
  }

  notifyAuth();
  notifyDrifts();
  return currentAuthUser;
}

export async function mockSignInWithGoogle(): Promise<AuthUser> {
  currentAuthUser = {
    uid: 'mock-google-user',
    isAnonymous: false,
    photoURL: null,
    displayName: 'Demo User',
  };

  if (!users.has(currentAuthUser.uid)) {
    const profile = { ...defaultProfileFor(currentAuthUser), username: 'demo_user' };
    users.set(profile.uid, profile);
    usernameClaims.set(normalizedUsername(profile.username), profile.uid);
  }

  notifyAuth();
  notifyDrifts();
  return currentAuthUser;
}

export async function mockSignOut(): Promise<void> {
  currentAuthUser = null;
  notifyAuth();
  notifyDrifts();
}

export async function mockGetUserProfile(uid: string): Promise<AppUser | null> {
  const existing = users.get(uid);

  if (existing) {
    return existing;
  }

  if (currentAuthUser?.uid === uid) {
    const profile = defaultProfileFor(currentAuthUser);
    users.set(uid, profile);
    usernameClaims.set(normalizedUsername(profile.username), uid);
    return profile;
  }

  return null;
}

export async function mockIsUsernameAvailable(username: string): Promise<boolean> {
  return !usernameClaims.has(normalizedUsername(username));
}

export async function mockCreateUserProfile(user: AuthUser, username: string): Promise<AppUser> {
  const cleanUsername = username.trim();
  const normalized = normalizedUsername(cleanUsername);

  if (usernameClaims.has(normalized)) {
    throw new Error('Username is already taken.');
  }

  const profile: AppUser = {
    ...defaultProfileFor(user),
    username: cleanUsername,
  };

  users.set(user.uid, profile);
  usernameClaims.set(normalized, user.uid);
  notifyAuth();
  notifyDrifts();
  return profile;
}

export function subscribeMockActiveDrifts(
  category: CategoryFilter,
  limitCount: number,
  callback: DriftListener,
): () => void {
  const listener = { category, limitCount, callback };
  feedListeners.add(listener);
  callback(activeFeed(category, limitCount));

  return () => {
    feedListeners.delete(listener);
  };
}

export function subscribeMockDrift(driftId: string, callback: SingleDriftListener): () => void {
  const listener = { driftId, callback };
  driftListeners.add(listener);
  callback(drifts.find((drift) => drift.id === driftId) ?? null);

  return () => {
    driftListeners.delete(listener);
  };
}

export async function mockGetDrift(driftId: string): Promise<Drift | null> {
  return drifts.find((drift) => drift.id === driftId) ?? null;
}

export async function mockCreateDrift(input: CreateDriftInput, author: AppUser): Promise<string> {
  const driftId = `mock-drift-${Date.now()}`;
  const drift: Drift = {
    id: driftId,
    authorUid: author.uid,
    authorUsername: input.isAnonymous ? 'ghost' : author.username,
    text: input.text.trim(),
    stake: input.stake.trim(),
    votesYes: 0,
    votesNo: 0,
    voters: {},
    status: 'active',
    result: null,
    createdAt: new Date(),
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    proofUrl: null,
    proofUploadedAt: null,
    category: input.category,
    isAnonymous: input.isAnonymous,
    viewCount: 0,
  };

  drifts = [drift, ...drifts];
  users.set(author.uid, { ...author, driftsCreated: author.driftsCreated + 1 });
  notifyDrifts();
  return driftId;
}

export async function mockIncrementDriftView(driftId: string): Promise<void> {
  drifts = drifts.map((drift) => (drift.id === driftId ? { ...drift, viewCount: drift.viewCount + 1 } : drift));
  notifyDrifts();
}

export async function mockSettleExpiredDriftIfAuthor(drift: Drift, currentUid: string): Promise<void> {
  if (drift.authorUid !== currentUid || drift.status !== 'active' || !isExpired(drift.expiresAt)) {
    return;
  }

  drifts = drifts.map((item) =>
    item.id === drift.id
      ? {
          ...item,
          status: 'decided',
          result: item.votesYes >= item.votesNo ? 'yes' : 'no',
        }
      : item,
  );
  notifyDrifts();
}

export function subscribeMockCreatedDrifts(uid: string, callback: DriftListener): () => void {
  const listener = { uid, callback };
  createdListeners.add(listener);
  callback(drifts.filter((drift) => drift.authorUid === uid));

  return () => {
    createdListeners.delete(listener);
  };
}

export function subscribeMockVotedDrifts(uid: string, callback: DriftListener): () => void {
  const listener = { uid, callback };
  votedListeners.add(listener);
  callback(drifts.filter((drift) => drift.voters[uid]));

  return () => {
    votedListeners.delete(listener);
  };
}

export async function mockCastVote(driftId: string, uid: string, vote: DriftVote): Promise<void> {
  const drift = drifts.find((item) => item.id === driftId);

  if (!drift) {
    throw new Error('Drift no longer exists.');
  }

  if (drift.status !== 'active') {
    throw new Error('Voting is closed for this drift.');
  }

  if (isExpired(drift.expiresAt)) {
    throw new Error('Voting window has ended.');
  }

  if (drift.authorUid === uid) {
    throw new Error('Authors cannot vote on their own drift.');
  }

  if (drift.voters[uid]) {
    throw new Error('You already voted on this drift.');
  }

  drifts = drifts.map((item) =>
    item.id === driftId
      ? {
          ...item,
          voters: { ...item.voters, [uid]: vote },
          votesYes: vote === 'yes' ? item.votesYes + 1 : item.votesYes,
          votesNo: vote === 'no' ? item.votesNo + 1 : item.votesNo,
        }
      : item,
  );

  const profile = currentProfile();

  if (profile?.uid === uid) {
    users.set(uid, { ...profile, driftsVotedOn: profile.driftsVotedOn + 1 });
  }

  notifyDrifts();
}

export async function mockUploadDriftProof(driftId: string, authorUid: string, proofUrl: string): Promise<string> {
  const uploadedAt = new Date();
  drifts = drifts.map((drift) =>
    drift.id === driftId
      ? {
          ...drift,
          status: 'executed',
          proofUrl,
          proofUploadedAt: uploadedAt,
        }
      : drift,
  );

  const profile = users.get(authorUid);

  if (profile) {
    users.set(authorUid, {
      ...profile,
      reputationScore: calcReputationOnSuccess(profile.reputationScore),
      driftsExecuted: profile.driftsExecuted + 1,
      streakCurrent: profile.streakCurrent + 1,
      streakBest: Math.max(profile.streakBest, profile.streakCurrent + 1),
    });
  }

  notifyDrifts();
  return proofUrl;
}
