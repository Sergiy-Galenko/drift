import { useState } from 'react';
import { Alert, Pressable, ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { CommentItem } from '@/components/drift/CommentItem';
import { DriftCard } from '@/components/drift/DriftCard';
import { ProofMedia } from '@/components/drift/ProofMedia';
import { CasePanel } from '@/components/dossier/CasePanel';
import { DossierSkeleton } from '@/components/dossier/DossierSkeleton';
import { InkStamp } from '@/components/dossier/InkStamp';
import { BookmarkIcon, CommentIcon, ShareIcon, UploadIcon, UsersIcon } from '@/components/icons';
import { Header } from '@/components/navigation/Header';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { IconButton } from '@/components/ui/IconButton';
import { Input } from '@/components/ui/Input';
import { Colors, F, S } from '@/constants/tokens';
import { useBookmark } from '@/hooks/useBookmark';
import { useComments } from '@/hooks/useComments';
import { useDrift } from '@/hooks/useDrift';
import { useFollow } from '@/hooks/useFollow';
import { deleteDrift, incrementDriftShare } from '@/lib/firebase/drifts';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';
import type { Comment } from '@/types/comment';
import { firebaseErrorMessage } from '@/utils/formatters';
import { logger } from '@/utils/logger';

export default function DriftDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string }>();
  const driftId = typeof params.id === 'string' ? params.id : undefined;
  const uid = useAuthStore((state) => state.firebaseUser?.uid);
  const pushToast = useUIStore((state) => state.pushToast);
  const { drift, loading, error } = useDrift(driftId);
  const bookmark = useBookmark(driftId);
  const follow = useFollow(drift?.authorUid);
  const comments = useComments(driftId);
  const [commentText, setCommentText] = useState('');
  const [replyTo, setReplyTo] = useState<Comment | null>(null);

  const deleteOwnComment = (comment: Comment) => {
    Alert.alert('Delete comment?', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => void comments.removeComment(comment) },
    ]);
  };

  const deleteOwnDrift = () => {
    if (!drift || !uid) return;
    Alert.alert('Delete drift?', 'Its comments and saved references will no longer be available.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          void deleteDrift(drift.id, uid)
            .then(() => router.back())
            .catch((error: unknown) => {
              logger.error('Delete drift failed', { error: String(error) });
              pushToast({ title: 'Could not delete drift', message: firebaseErrorMessage(String(error)), tone: 'danger' });
            });
        },
      },
    ]);
  };

  const submitComment = async () => {
    const ok = await comments.postComment(commentText, replyTo?.id ?? null);
    if (ok) {
      setCommentText('');
      setReplyTo(null);
    }
  };

  const share = async () => {
    if (!drift) return;
    if (drift.result) {
      router.push({ pathname: '/(modals)/share-result', params: { id: drift.id } } as never);
      return;
    }
    try {
      await Share.share({ message: `Vote on this DRIFT: ${drift.text}` });
      void incrementDriftShare(drift.id).catch((error: unknown) => {
        logger.warn('Share count failed', { error: String(error) });
      });
    } catch (error) {
      logger.warn('Share failed', { error: String(error) });
    }
  };

  if (loading) {
    return (
      <View style={styles.root}>
        <Header title="CASE FILE" showBack />
        <DossierSkeleton rows={3} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.root}>
        <Header title="CASE FILE" showBack />
        <ErrorState title="Case file unavailable" message="The file could not be opened." />
      </View>
    );
  }

  if (!drift) {
    return (
      <View style={styles.root}>
        <Header title="CASE FILE" showBack />
        <EmptyState title="Drift not found" message="This commitment may have been removed." />
      </View>
    );
  }

  const canUploadProof = uid === drift.authorUid && drift.status === 'proof_pending';

  return (
    <View style={styles.root}>
      <Header title="CASE FILE" showBack />
      <ScrollView contentContainerStyle={styles.content}>
        <DriftCard drift={drift} />
        <CasePanel style={styles.history}>
          <Text style={styles.historyTitle}>STAMP HISTORY</Text>
          <View style={styles.stamps}>
            <InkStamp label="LOGGED" tone="neutral" compact />
            <InkStamp label={drift.status === 'executed' ? 'FULFILLED' : drift.status === 'failed' ? 'BROKEN' : drift.status === 'proof_pending' ? 'PROOF DUE' : 'UNDER REVIEW'} tone={drift.status === 'executed' ? 'ledger' : drift.status === 'failed' ? 'oxblood' : drift.status === 'proof_pending' ? 'gold' : 'blue'} compact />
          </View>
          <Text style={styles.historyMeta}>FILE / {drift.id.slice(0, 8).toUpperCase()} · {drift.votesYes + drift.votesNo} BALLOTS</Text>
        </CasePanel>
        <View style={styles.actions}>
          <IconButton icon={BookmarkIcon} label="Bookmark" active={bookmark.saved} onPress={() => void bookmark.toggle()} />
          <IconButton icon={ShareIcon} label={drift.result ? 'Share result card' : 'Share'} onPress={() => void share()} />
          <IconButton
            icon={UsersIcon}
            label="Voters"
            onPress={() =>
              router.push({
                pathname: '/(drift)/voters/[id]',
                params: { id: drift.id },
              })
            }
          />
          {canUploadProof ? (
            <IconButton
              icon={UploadIcon}
              label="Upload proof"
              onPress={() =>
                router.push({
                  pathname: '/(drift)/proof/[id]',
                  params: { id: drift.id },
                })
              }
            />
          ) : null}
        </View>
        {uid !== drift.authorUid ? (
          <Button
            label={follow.following ? 'Following author' : 'Follow author'}
            variant="secondary"
            onPress={() => void follow.toggle()}
            disabled={!follow.canFollow}
          />
        ) : null}
        {uid === drift.authorUid && drift.status === 'active' ? (
          <View style={styles.ownerActions}>
            <Button label="Edit drift" variant="secondary" onPress={() => router.push({ pathname: '/(modals)/edit-drift', params: { id: drift.id } })} />
            <Button label="Delete drift" variant="danger" onPress={deleteOwnDrift} />
          </View>
        ) : null}
        {drift.proofUrl || drift.status !== 'active' ? (
          <ProofMedia url={drift.proofUrl} type={drift.proofType} />
        ) : null}
        <View style={styles.commentsHead}>
          <CommentIcon color={Colors.dossier} />
          <Text style={styles.sectionTitle}>{drift.commentCount} COMMENTS</Text>
        </View>
        {replyTo ? (
          <Pressable onPress={() => setReplyTo(null)}>
            <Text style={styles.replying}>
              Replying to @{replyTo.authorUsername}. Tap to cancel.
            </Text>
          </Pressable>
        ) : null}
        <Input
          value={commentText}
          onChangeText={setCommentText}
          placeholder="Add weight to the room..."
          multiline
        />
        <Button
          label="Post comment"
          onPress={() => void submitComment()}
          variant="secondary"
          disabled={commentText.trim().length === 0}
        />
        <View style={styles.commentList}>
          {comments.topLevel.map((comment) => (
            <View key={comment.id} style={styles.commentGroup}>
              <CommentItem comment={comment} canDelete={comment.authorUid === uid} onLike={comments.likeComment} onReply={setReplyTo} onDelete={deleteOwnComment} onReport={(item) => router.push({ pathname: '/(modals)/report-comment', params: { driftId: drift.id, commentId: item.id } })} />
              {comments.repliesFor(comment.id).map((reply) => (
                <CommentItem
                  key={reply.id}
                  comment={reply}
                  isReply
                  canDelete={reply.authorUid === uid}
                  onLike={comments.likeComment}
                  onDelete={deleteOwnComment}
                  onReport={(item) => router.push({ pathname: '/(modals)/report-comment', params: { driftId: drift.id, commentId: item.id } })}
                />
              ))}
            </View>
          ))}
          {comments.topLevel.length === 0 ? (
            <EmptyState title="No comments" message="Be the first stranger to weigh in." />
          ) : null}
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
  ownerActions: {
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
    color: Colors.dossier,
    fontFamily: F.family.monoBold,
    fontSize: F.size.sm,
  },
  replying: {
    color: Colors.goldFoil,
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
  history: {
    marginHorizontal: S.md,
  },
  historyTitle: {
    color: Colors.ink,
    fontFamily: F.family.monoBold,
    fontSize: F.size.xs,
  },
  stamps: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: S.sm,
    marginTop: S.sm,
  },
  historyMeta: {
    color: Colors.slate,
    fontFamily: F.family.monoMedium,
    fontSize: F.size.xs,
    marginTop: S.md,
  },
});
