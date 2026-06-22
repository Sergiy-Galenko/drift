import type { Timestamp } from 'firebase/firestore';

export type FirestoreUser = {
  uid: string;
  username: string;
  avatarUrl: string | null;
  reputationScore: number;
  streakCurrent: number;
  streakBest: number;
  driftsCreated: number;
  driftsVotedOn: number;
  driftsExecuted: number;
  joinedAt: Timestamp;
  isAnonymous: boolean;
};

export type AppUser = Omit<FirestoreUser, 'joinedAt'> & {
  joinedAt: Date;
};

export type UsernameClaim = {
  uid: string;
  username: string;
  createdAt: Timestamp;
};
