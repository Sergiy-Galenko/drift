import type { Timestamp } from 'firebase/firestore';

import type { UserProfile } from './user';

export interface ConversationDoc {
  id: string;
  participants: string[];
  lastMessage: string | null;
  lastMessageAt: Timestamp | null;
  lastMessageSenderUid: string | null;
  unreadCount: Record<string, number>;
  createdAt: Timestamp;
}

export interface MessageDoc {
  id: string;
  senderUid: string;
  text: string | null;
  mediaUrl: string | null;
  mediaType: 'image' | 'video' | null;
  sharedDriftId: string | null;
  isRead: boolean;
  readAt: Timestamp | null;
  createdAt: Timestamp;
  isDeleted: boolean;
}

export type ChatMessage = Omit<MessageDoc, 'createdAt' | 'readAt'> & {
  createdAt: Date;
  readAt: Date | null;
};

export type ConversationPreview = Omit<ConversationDoc, 'createdAt' | 'lastMessageAt'> & {
  createdAt: Date;
  lastMessageAt: Date | null;
  otherUser: Pick<UserProfile, 'uid' | 'username' | 'avatarUrl' | 'reputationScore'> | null;
  unread: number;
};
