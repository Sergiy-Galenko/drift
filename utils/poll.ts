import type { Drift, DriftPollType, PollVote } from '@/types/drift';

export function pollTypeOf(drift: Drift): DriftPollType {
  return drift.pollType ?? 'binary';
}

export function isBinaryPoll(drift: Drift): boolean {
  return pollTypeOf(drift) === 'binary';
}

export function voteCount(drift: Drift): number {
  return Object.keys(drift.voters).length;
}

export function optionLabel(drift: Drift, optionId: string): string {
  return drift.pollOptions?.find((option) => option.id === optionId)?.label ?? optionId;
}

export function pollResultLabel(drift: Drift): string {
  if (!drift.result) return 'NO RESULT';
  return isBinaryPoll(drift) ? drift.result.toUpperCase() : optionLabel(drift, drift.result);
}

export function pollVoteLabel(drift: Drift, vote: PollVote): string {
  if (Array.isArray(vote)) return vote.map((optionId) => optionLabel(drift, optionId)).join(' → ');
  return isBinaryPoll(drift) ? vote.toUpperCase() : optionLabel(drift, vote);
}
