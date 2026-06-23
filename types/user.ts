import type { Timestamp } from 'firebase/firestore';

export type ReputationTier = 'ghost' | 'low' | 'mid' | 'high' | 'legend';

export type UserSettings = {
  notificationsEnabled: boolean;
  anonymousDefault: boolean;
  vibrationEnabled: boolean;
};

export interface UserDoc {
  uid: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
  bio: string | null;
  reputationScore: number;
  reputationTier: ReputationTier;
  streakCurrent: number;
  streakBest: number;
  streakLastDate: string | null;
  driftsCreated: number;
  driftsVotedOn: number;
  driftsExecuted: number;
  driftsFailed: number;
  totalVotesReceived: number;
  followersCount: number;
  followingCount: number;
  joinedAt: Timestamp;
  lastActiveAt: Timestamp;
  isAnonymous: boolean;
  isVerified: boolean;
  settings: UserSettings;
}

export type UserProfile = Omit<UserDoc, 'joinedAt' | 'lastActiveAt'> & {
  joinedAt: Date;
  lastActiveAt: Date;
};

export type UserProfileInput = {
  username: string;
  displayName?: string | null;
  avatarUrl?: string | null;
  bio?: string | null;
  isAnonymous: boolean;
};
