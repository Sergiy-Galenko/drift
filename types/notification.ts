import type { Timestamp } from 'firebase/firestore';

export type NotificationType =
  | 'vote_milestone'
  | 'proof_reminder'
  | 'proof_deadline'
  | 'proof_uploaded'
  | 'drift_executed'
  | 'author_failed'
  | 'new_follower'
  | 'drift_featured'
  | 'comment_on_drift'
  | 'comment_reply'
  | 'reputation_milestone';

export interface NotificationDoc {
  id: string;
  type: NotificationType;
  driftId: string | null;
  driftText: string | null;
  fromUid: string | null;
  fromUsername: string | null;
  isRead: boolean;
  createdAt: Timestamp;
  data: Record<string, unknown>;
}

export type NotificationItem = Omit<NotificationDoc, 'createdAt'> & {
  createdAt: Date;
};
