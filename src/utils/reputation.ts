import { colors } from '@/constants/colors';

export function calcReputationOnSuccess(current: number): number {
  return Math.min(100, current + 5);
}

export function calcReputationOnFail(current: number): number {
  return Math.max(0, current - 10);
}

export function reputationColor(score: number): string {
  if (score <= 30) {
    return colors.fire;
  }

  if (score <= 69) {
    return colors.textMuted;
  }

  return colors.volt;
}
