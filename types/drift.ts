import type { Timestamp } from 'firebase/firestore';

export type DriftCategory = 'life' | 'career' | 'love' | 'money' | 'health' | 'random';
export const VOTING_DURATION_HOURS = [1, 6, 24, 72] as const;
export type VotingDurationHours = (typeof VOTING_DURATION_HOURS)[number];
export type DriftPollType = 'binary' | 'choice' | 'ranking' | 'plan';
export type DriftVote = 'yes' | 'no';
export type DriftStatus = 'active' | 'decided' | 'proof_pending' | 'executed' | 'failed' | 'cancelled';
export type PollVote = DriftVote | string | string[];
export type DriftResult = string | null;
export type DriftVoters = Record<string, PollVote>;
export type PollOption = { id: string; label: string };

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
  voterIds?: string[];
  pollType?: DriftPollType;
  pollOptions?: PollOption[];
  optionTallies?: Record<string, number>;
  status: DriftStatus;
  result: DriftResult;
  createdAt: Timestamp;
  expiresAt: Timestamp;
  votingDurationHours?: VotingDurationHours;
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
  durationHours: VotingDurationHours;
  pollType: DriftPollType;
  pollOptions: string[];
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
