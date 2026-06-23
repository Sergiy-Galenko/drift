import { format, formatDistanceToNow } from 'date-fns';

import { CATEGORIES } from '@/constants/categories';
import type { DriftCategory } from '@/types/drift';
import type { NotificationType } from '@/types/notification';

export function formatCategory(category: DriftCategory): string {
  return CATEGORIES[category].label;
}

export function formatRelativeTime(date: Date): string {
  return formatDistanceToNow(date, { addSuffix: true });
}

export function formatAbsoluteTime(date: Date): string {
  return format(date, 'MMM d, h:mm a');
}

export function formatVoteCount(total: number): string {
  if (total >= 1000000) return `${Math.floor(total / 100000) / 10}M`;
  if (total >= 1000) return `${Math.floor(total / 100) / 10}K`;
  return String(total);
}

export function firebaseErrorMessage(codeOrMessage: string): string {
  if (codeOrMessage.includes('auth/operation-not-allowed')) return 'Enable Email/Password in Firebase Authentication -> Sign-in method.';
  if (codeOrMessage.includes('auth/email-already-in-use')) return 'This email is already registered.';
  if (codeOrMessage.includes('auth/invalid-email')) return 'Enter a valid email address.';
  if (codeOrMessage.includes('auth/invalid-credential')) return 'Email or password is incorrect.';
  if (codeOrMessage.includes('auth/user-not-found')) return 'Email or password is incorrect.';
  if (codeOrMessage.includes('auth/wrong-password')) return 'Email or password is incorrect.';
  if (codeOrMessage.includes('auth/weak-password')) return 'Password must be at least 6 characters.';
  if (codeOrMessage.includes('auth/popup-closed')) return 'Sign in was cancelled.';
  if (codeOrMessage.includes('auth/network-request-failed')) return 'Network connection failed.';
  if (codeOrMessage.includes('permission-denied')) return 'You do not have permission to do that.';
  if (codeOrMessage.includes('not-found')) return 'That item no longer exists.';
  return 'Something went wrong. Try again.';
}

export function notificationTitle(type: NotificationType): string {
  switch (type) {
    case 'vote_milestone':
      return 'Vote milestone hit';
    case 'proof_reminder':
      return 'Proof deadline approaching';
    case 'proof_deadline':
      return 'Proof deadline passed';
    case 'proof_uploaded':
      return 'Proof uploaded';
    case 'drift_executed':
      return 'Drift executed';
    case 'author_failed':
      return 'Author missed proof';
    case 'new_follower':
      return 'New follower';
    case 'drift_featured':
      return 'Drift featured';
    case 'comment_on_drift':
      return 'New comment';
    case 'comment_reply':
      return 'New reply';
    case 'reputation_milestone':
      return 'Reputation milestone';
  }
}
