import * as Sentry from '@sentry/react-native';
import { httpsCallable } from 'firebase/functions';

import { functions } from '@/lib/firebase/config';
import { logger } from '@/utils/logger';

export const ANALYTICS_EVENTS = [
  'account_registered',
  'app_opened',
  'app_returned',
  'drift_created',
  'vote_cast',
  'case_opened',
  'roulette_spun',
  'proof_uploaded',
] as const;

export type AnalyticsEventName = (typeof ANALYTICS_EVENTS)[number];
type AnalyticsValue = string | number | boolean;

function sanitizeMetadata(metadata: Record<string, unknown>): Record<string, AnalyticsValue> {
  const entries: [string, AnalyticsValue][] = [];

  for (const [key, value] of Object.entries(metadata).slice(0, 8)) {
    if (!/^[a-z][a-z0-9_]{0,31}$/i.test(key)) continue;
    if (typeof value === 'string') entries.push([key, value.slice(0, 80)]);
    if (typeof value === 'number' && Number.isFinite(value)) entries.push([key, value]);
    if (typeof value === 'boolean') entries.push([key, value]);
  }

  return Object.fromEntries(entries);
}

export function setAnalyticsUser(uid: string | null, username?: string | null): void {
  Sentry.setUser(uid ? { id: uid, username: username ?? undefined } : null);
}

export function trackEvent(name: AnalyticsEventName, metadata: Record<string, unknown> = {}): void {
  const data = sanitizeMetadata(metadata);
  Sentry.addBreadcrumb({ category: 'analytics', level: 'info', message: name, data });

  void httpsCallable<{ event: AnalyticsEventName; data: Record<string, AnalyticsValue> }, { ok: boolean }>(functions, 'trackAnalytics')({ event: name, data })
    .catch((error: unknown) => logger.warn('Analytics event failed', { event: name, error: String(error) }));
}
