export const DAY_MS = 24 * 60 * 60 * 1000;
export const HOUR_MS = 60 * 60 * 1000;
export const PROOF_WINDOW_MS = 24 * 60 * 60 * 1000;

export function clampProgress(value: number): number {
  return Math.max(0, Math.min(1, value));
}

export function remainingMs(expiresAt: Date, now = Date.now()): number {
  return Math.max(0, expiresAt.getTime() - now);
}

export function countdownProgress(expiresAt: Date, now = Date.now()): number {
  return clampProgress(remainingMs(expiresAt, now) / DAY_MS);
}

export function isUnderOneHour(expiresAt: Date, now = Date.now()): boolean {
  const remaining = remainingMs(expiresAt, now);
  return remaining > 0 && remaining < HOUR_MS;
}

export function isExpired(expiresAt: Date, now = Date.now()): boolean {
  return expiresAt.getTime() <= now;
}

export function formatRemaining(expiresAt: Date, now = Date.now()): string {
  const ms = remainingMs(expiresAt, now);
  const hours = Math.floor(ms / HOUR_MS);
  const minutes = Math.floor((ms % HOUR_MS) / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }

  return `${minutes}m ${seconds}s`;
}

export function isProofWindowOpen(expiresAt: Date, now = Date.now()): boolean {
  const proofDeadline = expiresAt.getTime() + PROOF_WINDOW_MS;
  return expiresAt.getTime() <= now && now <= proofDeadline;
}
