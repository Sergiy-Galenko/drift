import type { UserProfile } from '@/types/user';

import type { AchievementEvaluator } from '../types/roulette.types';

const ACHIEVEMENT_LABELS: Record<string, string> = {
  streak_7: '7-day streak',
  vote_signal_25: '25 vote signals',
  reputation_75: '75 reputation',
};

const ACHIEVEMENT_EVALUATORS: Record<string, AchievementEvaluator> = {
  streak_7: (profile) => Boolean(profile && (profile.streakCurrent >= 7 || profile.streakBest >= 7)),
  vote_signal_25: (profile) => Boolean(profile && (profile.driftsVotedOn >= 25 || profile.totalVotesReceived >= 25)),
  reputation_75: (profile) => Boolean(profile && profile.reputationScore >= 75),
};

export function getAchievementLabel(achievementId: string): string {
  return ACHIEVEMENT_LABELS[achievementId] ?? achievementId;
}

export function isAchievementUnlocked(achievementId: string, profile: UserProfile | null): boolean {
  const evaluator = ACHIEVEMENT_EVALUATORS[achievementId];

  if (!evaluator) {
    // TODO: integrate with real backend achievement service.
    // Expected contract: achievementService.hasUnlocked(uid, achievementId) returns
    // the canonical server-side unlock state for the authenticated user.
    return false;
  }

  return evaluator(profile);
}
