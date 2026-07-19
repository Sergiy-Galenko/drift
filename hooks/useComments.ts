import { useCallback, useEffect, useMemo, useState } from 'react';

import { addComment, deleteComment, subscribeComments, toggleCommentLike } from '@/lib/firebase/comments';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';
import type { Comment } from '@/types/comment';
import { firebaseErrorMessage } from '@/utils/formatters';
import { logger } from '@/utils/logger';
import { CommentSchema } from '@/utils/validation';

export function useComments(driftId: string | undefined) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const profile = useAuthStore((state) => state.profile);
  const uid = useAuthStore((state) => state.firebaseUser?.uid);
  const pushToast = useUIStore((state) => state.pushToast);

  useEffect(() => {
    if (!driftId) {
      setComments([]);
      setLoading(false);
      return;
    }

    setComments([]);
    setLoading(true);

    const unsubscribe = subscribeComments(
      driftId,
      (items) => {
        setComments(items);
        setLoading(false);
      },
      (message) => {
        logger.error('Comments subscription failed', { message });
        pushToast({ title: 'Comments unavailable', message: firebaseErrorMessage(message), tone: 'danger' });
        setLoading(false);
      },
    );

    return unsubscribe;
  }, [driftId, pushToast]);

  const { topLevel, repliesByParent } = useMemo(() => {
    const nextTopLevel: Comment[] = [];
    const nextRepliesByParent: Record<string, Comment[]> = {};

    for (const comment of comments) {
      if (comment.parentId === null) {
        nextTopLevel.push(comment);
        continue;
      }

      (nextRepliesByParent[comment.parentId] ??= []).push(comment);
    }

    return { topLevel: nextTopLevel, repliesByParent: nextRepliesByParent };
  }, [comments]);

  const repliesFor = useCallback(
    (commentId: string) => repliesByParent[commentId] ?? [],
    [repliesByParent],
  );

  const postComment = useCallback(
    async (text: string, parentId: string | null = null) => {
      if (!driftId || !profile) {
        pushToast({ title: 'Not signed in', message: 'Sign in before commenting.', tone: 'warning' });
        return false;
      }

      const parsed = CommentSchema.safeParse(text);
      if (!parsed.success) {
        pushToast({ title: 'Comment invalid', message: parsed.error.issues[0]?.message, tone: 'warning' });
        return false;
      }

      try {
        await addComment(driftId, parsed.data, profile, parentId);
        return true;
      } catch (error) {
        logger.error('Comment failed', { error: String(error) });
        pushToast({ title: 'Comment failed', message: firebaseErrorMessage(String(error)), tone: 'danger' });
        return false;
      }
    },
    [driftId, profile, pushToast],
  );

  const likeComment = useCallback(
    async (comment: Comment) => {
      if (!driftId || !uid) {
        pushToast({ title: 'Not signed in', message: 'Sign in before liking comments.', tone: 'warning' });
        return;
      }

      try {
        await toggleCommentLike(driftId, comment, uid);
      } catch (error) {
        logger.error('Comment like failed', { error: String(error) });
        pushToast({ title: 'Like failed', message: firebaseErrorMessage(String(error)), tone: 'danger' });
      }
    },
    [driftId, pushToast, uid],
  );

  const removeComment = useCallback(
    async (comment: Comment) => {
      if (!driftId || !uid || comment.authorUid !== uid) {
        pushToast({ title: 'Delete unavailable', message: 'You can only delete your own comments.', tone: 'warning' });
        return false;
      }

      try {
        await deleteComment(driftId, comment.id);
        return true;
      } catch (error) {
        logger.error('Comment deletion failed', { error: String(error) });
        pushToast({ title: 'Could not delete comment', message: firebaseErrorMessage(String(error)), tone: 'danger' });
        return false;
      }
    },
    [driftId, pushToast, uid],
  );

  return { comments, topLevel, repliesFor, loading, postComment, likeComment, removeComment };
}
