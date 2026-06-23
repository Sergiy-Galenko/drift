import {
  collection,
  doc,
  increment,
  limit,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  updateDoc,
  type DocumentData,
  type QueryDocumentSnapshot,
  type Unsubscribe,
  type WithFieldValue,
} from 'firebase/firestore';

import { db } from './config';
import type { Comment, CommentDoc } from '@/types/comment';
import type { UserProfile } from '@/types/user';

function commentsRef(driftId: string) {
  return collection(db, 'comments', driftId, 'messages');
}

function commentRef(driftId: string, commentId: string) {
  return doc(db, 'comments', driftId, 'messages', commentId);
}

function driftRef(driftId: string) {
  return doc(db, 'drifts', driftId);
}

function mapComment(snapshot: QueryDocumentSnapshot<DocumentData>): Comment {
  const data = snapshot.data() as CommentDoc;
  return {
    ...data,
    id: data.id || snapshot.id,
    createdAt: data.createdAt.toDate(),
  };
}

export function subscribeComments(
  driftId: string,
  onData: (comments: Comment[]) => void,
  onError: (message: string) => void,
): Unsubscribe {
  return onSnapshot(
    query(commentsRef(driftId), orderBy('createdAt', 'asc'), limit(80)),
    (snapshot) => onData(snapshot.docs.map(mapComment).filter((comment) => !comment.isDeleted)),
    (error) => onError(error.code),
  );
}

export async function addComment(driftId: string, text: string, author: UserProfile, parentId: string | null): Promise<void> {
  const nextRef = doc(commentsRef(driftId));
  const comment: WithFieldValue<CommentDoc> = {
    id: nextRef.id,
    authorUid: author.uid,
    authorUsername: author.username,
    authorReputationScore: author.reputationScore,
    text: text.trim(),
    createdAt: serverTimestamp(),
    likesCount: 0,
    likedBy: [],
    isDeleted: false,
    parentId,
  };

  await runTransaction(db, async (transaction) => {
    transaction.set(nextRef, comment);
    transaction.update(driftRef(driftId), { commentCount: increment(1) });
  });
}

export async function toggleCommentLike(driftId: string, comment: Comment, uid: string): Promise<void> {
  const liked = comment.likedBy.includes(uid);
  await updateDoc(commentRef(driftId, comment.id), {
    likedBy: liked ? comment.likedBy.filter((id) => id !== uid) : [...comment.likedBy, uid],
    likesCount: increment(liked ? -1 : 1),
  });
}

export async function deleteComment(driftId: string, commentId: string): Promise<void> {
  await updateDoc(commentRef(driftId, commentId), {
    isDeleted: true,
    text: '',
  });
}
