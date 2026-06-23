import type { Timestamp } from 'firebase/firestore';

export interface CommentDoc {
  id: string;
  authorUid: string;
  authorUsername: string;
  authorReputationScore: number;
  text: string;
  createdAt: Timestamp;
  likesCount: number;
  likedBy: string[];
  isDeleted: boolean;
  parentId: string | null;
}

export type Comment = Omit<CommentDoc, 'createdAt'> & {
  createdAt: Date;
};
