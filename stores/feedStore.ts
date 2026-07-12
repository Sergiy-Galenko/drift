import { create } from 'zustand';

import type { CategoryFilter } from '@/constants/categories';
import type { Drift, DriftVote } from '@/types/drift';

type VoteSnapshot = {
  drift: Drift;
  vote: DriftVote | undefined;
};

interface FeedState {
  drifts: Record<string, Drift>;
  activeCategory: CategoryFilter | null;
  userVotes: Record<string, DriftVote>;
  voteSnapshots: Record<string, VoteSnapshot>;
  setDrifts: (drifts: Drift[], category: CategoryFilter) => void;
  optimisticVote: (driftId: string, direction: DriftVote) => void;
  rollbackVote: (driftId: string) => void;
  commitVote: (driftId: string, direction: DriftVote) => void;
  upsertDrift: (drift: Drift) => void;
}

export const useFeedStore = create<FeedState>((set) => ({
  drifts: {},
  activeCategory: null,
  userVotes: {},
  voteSnapshots: {},
  setDrifts: (drifts, category) =>
    set(() => ({
      drifts: Object.fromEntries(drifts.map((drift) => [drift.id, drift])),
      activeCategory: category,
    })),
  optimisticVote: (driftId, direction) =>
    set((state) => {
      const drift = state.drifts[driftId];
      if (!drift) return state;
      const previousVote = state.userVotes[driftId];
      const deltaYes = direction === 'yes' ? 1 : 0;
      const deltaNo = direction === 'no' ? 1 : 0;
      const previousYes = previousVote === 'yes' ? 1 : 0;
      const previousNo = previousVote === 'no' ? 1 : 0;
      const nextDrift: Drift = {
        ...drift,
        votesYes: Math.max(0, drift.votesYes - previousYes + deltaYes),
        votesNo: Math.max(0, drift.votesNo - previousNo + deltaNo),
        voters: { ...drift.voters, local: direction },
      };
      return {
        drifts: { ...state.drifts, [driftId]: nextDrift },
        userVotes: { ...state.userVotes, [driftId]: direction },
        voteSnapshots: { ...state.voteSnapshots, [driftId]: { drift, vote: previousVote } },
      };
    }),
  rollbackVote: (driftId) =>
    set((state) => {
      const snapshot = state.voteSnapshots[driftId];
      if (!snapshot) return state;
      const { [driftId]: removedSnapshot, ...voteSnapshots } = state.voteSnapshots;
      const nextVotes = { ...state.userVotes };
      if (snapshot.vote) {
        nextVotes[driftId] = snapshot.vote;
      } else {
        delete nextVotes[driftId];
      }
      return {
        drifts: { ...state.drifts, [driftId]: snapshot.drift },
        userVotes: nextVotes,
        voteSnapshots,
      };
    }),
  commitVote: (driftId, direction) =>
    set((state) => {
      const { [driftId]: removedSnapshot, ...voteSnapshots } = state.voteSnapshots;
      return {
        userVotes: { ...state.userVotes, [driftId]: direction },
        voteSnapshots,
      };
    }),
  upsertDrift: (drift) =>
    set((state) => ({
      drifts: { ...state.drifts, [drift.id]: drift },
    })),
}));
