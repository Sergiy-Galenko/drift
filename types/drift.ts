import type { Timestamp } from 'firebase/firestore';

export type DriftCategory = 'life' | 'career' | 'love' | 'money' | 'health' | 'random';
export type DriftVote = 'yes' | 'no';
export type DriftStatus = 'active' | 'decided' | 'proof_pending' | 'executed' | 'failed' | 'cancelled';
export type DriftResult = DriftVote | null;
export type DriftVoters = Record<string, DriftVote>;

export interface DriftDoc {
  id: string;
  authorUid: string;
  authorUsername: string;
  authorReputationScore: number;
  text: string;
  stake: string;
  context: string | null;
  votesYes: number;
  votesNo: number;
  voters: DriftVoters;
  status: DriftStatus;
  result: DriftResult;
  createdAt: Timestamp;
  expiresAt: Timestamp;
  decidedAt: Timestamp | null;
  proofUrl: string | null;
  proofType: 'image' | 'video' | null;
  proofUploadedAt: Timestamp | null;
  proofDeadline: Timestamp | null;
  category: DriftCategory;
  tags: string[];
  isAnonymous: boolean;
  viewCount: number;
  shareCount: number;
  bookmarkCount: number;
  commentCount: number;
  isFeatured: boolean;
  featuredAt: Timestamp | null;
  isNSFW: boolean;
  reportCount: number;
}

export type Drift = Omit<
  DriftDoc,
  'createdAt' | 'expiresAt' | 'decidedAt' | 'proofUploadedAt' | 'proofDeadline' | 'featuredAt'
> & {
  createdAt: Date;
  expiresAt: Date;
  decidedAt: Date | null;
  proofUploadedAt: Date | null;
  proofDeadline: Date | null;
  featuredAt: Date | null;
};

export type CreateDriftInput = {
  text: string;
  stake: string;
  context?: string;
  category: DriftCategory;
  isAnonymous: boolean;
  tags?: string[];
};

export interface BookmarkDoc {
  driftId: string;
  savedAt: Timestamp;
}

export interface FollowDoc {
  followerId: string;
  followingId: string;
  createdAt: Timestamp;
}

export interface ReportDoc {
  id: string;
  driftId: string;
  reporterUid: string;
  reason: 'fake_commitment' | 'spam' | 'harassment' | 'inappropriate' | 'other';
  details: string | null;
  createdAt: Timestamp;
  isResolved: boolean;
}

export interface TrendingDoc {
  driftIds: string[];
  updatedAt: Timestamp;
}
