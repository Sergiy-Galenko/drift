import { translate } from '@/lib/i18n';
import { useLocaleStore } from '@/stores/localeStore';

function t(value: string): string {
  return translate(useLocaleStore.getState().locale, value);
}

export function formatCountdown(expiresAt: Date, now = Date.now()): string {
  const ms = expiresAt.getTime() - now;
  if (ms <= 0) return t('Expired');
  const totalSecs = Math.floor(ms / 1000);
  const h = Math.floor(totalSecs / 3600);
  const m = Math.floor((totalSecs % 3600) / 60);
  const s = totalSecs % 60;
  if (h > 0) return `${h}${t('h')} ${m}${t('m')}`;
  if (m > 0) return `${m}${t('m')} ${s}${t('s')}`;
  return `${s}${t('s')}`;
}

export function formatCountdownShort(expiresAt: Date, now = Date.now()): string {
  const ms = expiresAt.getTime() - now;
  if (ms <= 0) return t('Done');
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  if (h > 0) return `${h}${t('h')}`;
  if (m > 0) return `${m}${t('m')}`;
  return `${s}${t('s')}`;
}

export function getCountdownProgress(createdAt: Date, expiresAt: Date, now = Date.now()): number {
  const total = expiresAt.getTime() - createdAt.getTime();
  const remaining = Math.max(0, expiresAt.getTime() - now);
  return total > 0 ? Math.min(1, remaining / total) : 0;
}

export function isExpiringSoon(expiresAt: Date, now = Date.now()): boolean {
  return expiresAt.getTime() - now < 3600000;
}

export function isExpired(expiresAt: Date): boolean {
  return expiresAt.getTime() <= Date.now();
}
