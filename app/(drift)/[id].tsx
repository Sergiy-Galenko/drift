import { useState } from 'react';
import { Pressable, ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { CommentItem } from '@/components/drift/CommentItem';
import { DriftCard } from '@/components/drift/DriftCard';
import { ProofMedia } from '@/components/drift/ProofMedia';
import { BookmarkIcon, CommentIcon, ShareIcon, UploadIcon, UsersIcon } from '@/components/icons';
import { Header } from '@/components/navigation/Header';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { IconButton } from '@/components/ui/IconButton';
import { Input } from '@/components/ui/Input';
import { Spinner } from '@/components/ui/Spinner';
import { Colors, F, S } from '@/constants/tokens';
import { useBookmark } from '@/hooks/useBookmark';
import { useComments } from '@/hooks/useComments';
import { useDrift } from '@/hooks/useDrift';
import { useFollow } from '@/hooks/useFollow';
import { incrementDriftShare } from '@/lib/firebase/drifts';
import { useAuthStore } from '@/stores/authStore';
import type { Comment } from '@/types/comment';
import { logger } from '@/utils/logger';

export default function DriftDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string }>();
  const driftId = typeof params.id === 'string' ? params.id : undefined;
  const uid = useAuthStore((state) => state.firebaseUser?.uid);
  const { drift, loading } = useDrift(driftId);
  const bookmark = useBookmark(driftId);
  const follow = useFollow(drift?.authorUid);
  const comments = useComments(driftId);
  const [commentText, setCommentText] = useState('');
  const [replyTo, setReplyTo] = useState<Comment | null>(null);

  const submitComment = async () => {
    const ok = await comments.postComment(commentText, replyTo?.id ?? null);
    if (ok) {
      setCommentText('');
      setReplyTo(null);
    }
  };

  const share = async () => {
    if (!drift) return;
    try {
      await Share.share({ message: `Vote on this DRIFT: ${drift.text}` });
      await incrementDriftShare(drift.id);
    } catch (error) {
      logger.warn('Share failed', { error: String(error) });
    }
  };

  if (loading) {
    return (
      <View style={styles.root}>
        <Header title="Drift" showBack />
        <Spinner label="Loading drift" />
      </View>
    );
  }

  if (!drift) {
    return (
      <View style={styles.root}>
        <Header title="Drift" showBack />
        <EmptyState title="Drift not found" message="This commitment may have been removed." />
      </View>
    );
  }

  const canUploadProof = uid === drift.authorUid && drift.status === 'proof_pending';

  return (
    <View style={styles.root}>
      <Header title="Drift" showBack />
      <ScrollView contentContainerStyle={styles.content}>
        <DriftCard drift={drift} />
        <View style={styles.actions}>
          <IconButton icon={BookmarkIcon} label="Bookmark" active={bookmark.saved} onPress={() => void bookmark.toggle()} />
          <IconButton icon={ShareIcon} label="Share" onPress={() => void share()} />
          <IconButton icon={UsersIcon} label="Voters" onPress={() => router.push({ pathname: '/(drift)/[id]/voters', params: { id: drift.id } })} />
          {canUploadProof ? (
            <IconButton icon={UploadIcon} label="Upload proof" onPress={() => router.push({ pathname: '/(drift)/[id]/proof', params: { id: drift.id } })} />
          ) : null}
        </View>
        {uid !== drift.authorUid ? (
          <Button label={follow.following ? 'Following author' : 'Follow author'} variant="secondary" onPress={() => void follow.toggle()} disabled={!follow.canFollow} />
        ) : null}
        {drift.proofUrl || drift.status !== 'active' ? <ProofMedia url={drift.proofUrl} type={drift.proofType} /> : null}
        <View style={styles.commentsHead}>
          <CommentIcon color={Colors.accentVolt} />
          <Text style={styles.sectionTitle}>{drift.commentCount} COMMENTS</Text>
        </View>
        {replyTo ? (
          <Pressable onPress={() => setReplyTo(null)}>
            <Text style={styles.replying}>Replying to @{replyTo.authorUsername}. Tap to cancel.</Text>
          </Pressable>
        ) : null}
        <Input value={commentText} onChangeText={setCommentText} placeholder="Add weight to the room..." multiline />
        <Button label="Post comment" onPress={() => void submitComment()} variant="secondary" />
        <View style={styles.commentList}>
          {comments.topLevel.map((comment) => (
            <View key={comment.id} style={styles.commentGroup}>
              <CommentItem comment={comment} onLike={comments.likeComment} onReply={setReplyTo} />
              {comments.repliesFor(comment.id).map((reply) => (
                <CommentItem key={reply.id} comment={reply} isReply onLike={comments.likeComment} />
              ))}
            </View>
          ))}
          {comments.topLevel.length === 0 ? <EmptyState title="No comments" message="Be the first stranger to weigh in." /> : null}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.bgBase,
  },
  content: {
    paddingBottom: S.x7,
    gap: S.lg,
  },
  actions: {
    flexDirection: 'row',
    gap: S.md,
    paddingHorizontal: S.md,
  },
  commentsHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: S.sm,
    paddingHorizontal: S.md,
  },
  sectionTitle: {
    color: Colors.textPrimary,
    fontFamily: F.family.monoBold,
    fontSize: F.size.sm,
  },
  replying: {
    color: Colors.accentAmber,
    fontFamily: F.family.bodySemi,
    fontSize: F.size.sm,
  },
  commentList: {
    gap: S.lg,
    paddingHorizontal: S.md,
  },
  commentGroup: {
    gap: S.md,
  },
});
