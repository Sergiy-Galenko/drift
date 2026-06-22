import type { Timestamp } from 'firebase/firestore';

export type DriftCategory = 'life' | 'career' | 'love' | 'money' | 'random';
export type DriftStatus = 'active' | 'decided' | 'executed' | 'failed';
export type DriftVote = 'yes' | 'no';
export type DriftResult = DriftVote | null;

export type DriftVoters = Record<string, DriftVote>;

export type FirestoreDrift = {
  id: string;
  authorUid: string;
  authorUsername: string;
  text: string;
  stake: string;
  votesYes: number;
  votesNo: number;
  voters: DriftVoters;
  status: DriftStatus;
  result: DriftResult;
  createdAt: Timestamp;
  expiresAt: Timestamp;
  proofUrl: string | null;
  proofUploadedAt: Timestamp | null;
  category: DriftCategory;
  isAnonymous: boolean;
  viewCount: number;
};

export type Drift = Omit<FirestoreDrift, 'createdAt' | 'expiresAt' | 'proofUploadedAt'> & {
  createdAt: Date;
  expiresAt: Date;
  proofUploadedAt: Date | null;
};

export type CreateDriftInput = {
  text: string;
  stake: string;
  category: DriftCategory;
  isAnonymous: boolean;
};
