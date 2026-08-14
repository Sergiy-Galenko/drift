import { format, formatDistanceToNow } from 'date-fns';
import { enUS, uk } from 'date-fns/locale';

import { CATEGORIES } from '@/constants/categories';
import { translate } from '@/lib/i18n';
import { useLocaleStore } from '@/stores/localeStore';
import type { DriftCategory } from '@/types/drift';
import type { NotificationType } from '@/types/notification';

export function formatCategory(category: DriftCategory): string {
  return CATEGORIES[category].label;
}

export function formatRelativeTime(date: Date): string {
  return formatDistanceToNow(date, { addSuffix: true, locale: useLocaleStore.getState().locale === 'uk' ? uk : enUS });
}

export function formatAbsoluteTime(date: Date): string {
  return format(date, 'Pp', { locale: useLocaleStore.getState().locale === 'uk' ? uk : enUS });
}

export function formatVoteCount(total: number): string {
  if (total >= 1000000) return `${Math.floor(total / 100000) / 10}M`;
  if (total >= 1000) return `${Math.floor(total / 100) / 10}K`;
  return String(total);
}

export function firebaseErrorMessage(codeOrMessage: string): string {
  const t = (value: string) => translate(useLocaleStore.getState().locale, value);
  if (codeOrMessage.includes('auth/operation-not-allowed')) return t('Enable Email/Password in Firebase Authentication -> Sign-in method.');
  if (codeOrMessage.includes('auth/email-already-in-use')) return t('This email is already registered.');
  if (codeOrMessage.includes('auth/invalid-email')) return t('Enter a valid email address.');
  if (codeOrMessage.includes('auth/invalid-credential')) return t('Email or password is incorrect.');
  if (codeOrMessage.includes('auth/user-not-found')) return t('Email or password is incorrect.');
  if (codeOrMessage.includes('auth/wrong-password')) return t('Email or password is incorrect.');
  if (codeOrMessage.includes('auth/weak-password')) return t('Password must be at least 6 characters.');
  if (codeOrMessage.includes('auth/popup-closed')) return t('Sign in was cancelled.');
  if (codeOrMessage.includes('auth/network-request-failed')) return t('Network connection failed.');
  if (codeOrMessage.includes('permission-denied')) return t('You do not have permission to do that.');
  if (codeOrMessage.includes('not-found')) return t('That item no longer exists.');
  return t('Something went wrong. Try again.');
}

export function notificationTitle(type: NotificationType): string {
  const t = (value: string) => translate(useLocaleStore.getState().locale, value);
  switch (type) {
    case 'voting_started':
      return t('Voting started');
    case 'voting_last_hour':
      return t('One hour left to vote');
    case 'vote_milestone':
      return t('Vote milestone hit');
    case 'proof_reminder':
      return t('Proof deadline approaching');
    case 'proof_deadline':
      return t('Proof deadline approaching');
    case 'proof_uploaded':
      return t('Proof uploaded');
    case 'drift_executed':
      return t('Drift executed');
    case 'author_failed':
      return t('Author missed proof');
    case 'new_follower':
      return t('New follower');
    case 'drift_featured':
      return t('Drift featured');
    case 'comment_on_drift':
      return t('New comment');
    case 'comment_reply':
      return t('New reply');
    case 'reputation_milestone':
      return t('Reputation milestone');
    case 'weekly_recap':
      return t('Weekly case summary');
  }
}
