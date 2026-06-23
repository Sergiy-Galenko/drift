export function formatCountdown(expiresAt: Date): string {
  const ms = expiresAt.getTime() - Date.now();
  if (ms <= 0) return 'Expired';
  const totalSecs = Math.floor(ms / 1000);
  const h = Math.floor(totalSecs / 3600);
  const m = Math.floor((totalSecs % 3600) / 60);
  const s = totalSecs % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

export function formatCountdownShort(expiresAt: Date): string {
  const ms = expiresAt.getTime() - Date.now();
  if (ms <= 0) return 'Done';
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  if (h > 0) return `${h}h`;
  if (m > 0) return `${m}m`;
  return `${s}s`;
}

export function getCountdownProgress(expiresAt: Date): number {
  const total = 24 * 3600 * 1000;
  const remaining = Math.max(0, expiresAt.getTime() - Date.now());
  return remaining / total;
}

export function isExpiringSoon(expiresAt: Date): boolean {
  return expiresAt.getTime() - Date.now() < 3600000;
}

export function isExpired(expiresAt: Date): boolean {
  return expiresAt.getTime() <= Date.now();
}
