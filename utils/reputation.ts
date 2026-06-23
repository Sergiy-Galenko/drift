import { Colors } from '@/constants/tokens';
import type { UserDoc } from '@/types/user';

export const REPUTATION_EVENTS = {
  PROOF_SUCCESS: 5,
  PROOF_FAIL: -10,
  VOTE_CAST: 0,
  STREAK_BONUS_7: 3,
  STREAK_BONUS_30: 8,
} as const;

export function calcReputationTier(score: number): UserDoc['reputationTier'] {
  if (score <= 20) return 'ghost';
  if (score <= 40) return 'low';
  if (score <= 60) return 'mid';
  if (score <= 80) return 'high';
  return 'legend';
}

export function reputationColor(score: number): string {
  if (score <= 20) return Colors.repGhost;
  if (score <= 40) return Colors.repLow;
  if (score <= 60) return Colors.repMid;
  if (score <= 80) return Colors.repHigh;
  return Colors.repLegend;
}

export function reputationLabel(score: number): string {
  if (score <= 20) return 'Ghost';
  if (score <= 40) return 'Unreliable';
  if (score <= 60) return 'Average';
  if (score <= 80) return 'Trusted';
  return 'Legend';
}

export function reputationLabelUpper(score: number): string {
  return reputationLabel(score).toUpperCase();
}

export function applyProofSuccess(user: UserDoc): Partial<UserDoc> {
  const newScore = Math.min(100, user.reputationScore + REPUTATION_EVENTS.PROOF_SUCCESS);
  const newStreak = user.streakCurrent + 1;
  const streakBonus =
    newStreak === 7
      ? REPUTATION_EVENTS.STREAK_BONUS_7
      : newStreak === 30
        ? REPUTATION_EVENTS.STREAK_BONUS_30
        : 0;
  const finalScore = Math.min(100, newScore + streakBonus);
  return {
    reputationScore: finalScore,
    reputationTier: calcReputationTier(finalScore),
    streakCurrent: newStreak,
    streakBest: Math.max(user.streakBest, newStreak),
    driftsExecuted: user.driftsExecuted + 1,
  };
}

export function applyProofFail(user: UserDoc): Partial<UserDoc> {
  const newScore = Math.max(0, user.reputationScore + REPUTATION_EVENTS.PROOF_FAIL);
  return {
    reputationScore: newScore,
    reputationTier: calcReputationTier(newScore),
    streakCurrent: 0,
    driftsFailed: user.driftsFailed + 1,
  };
}
