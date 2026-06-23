import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Avatar } from '@/components/ui/Avatar';
import { Colors, F, S } from '@/constants/tokens';
import type { Comment } from '@/types/comment';
import { formatRelativeTime } from '@/utils/formatters';

type CommentItemProps = {
  comment: Comment;
  isReply?: boolean;
  onLike?: (comment: Comment) => void;
  onReply?: (comment: Comment) => void;
};

export function CommentItem({ comment, isReply = false, onLike, onReply }: CommentItemProps) {
  return (
    <View style={[styles.row, isReply ? styles.reply : null]}>
      <Avatar username={comment.authorUsername} avatarUrl={null} reputationScore={comment.authorReputationScore} size={34} />
      <View style={styles.body}>
        <View style={styles.metaRow}>
          <Text style={styles.username}>@{comment.authorUsername}</Text>
          <Text style={styles.time}>{formatRelativeTime(comment.createdAt)}</Text>
        </View>
        <Text style={styles.text}>{comment.text}</Text>
        <View style={styles.actions}>
          <Pressable onPress={() => onLike?.(comment)}>
            <Text style={styles.action}>{comment.likesCount} LIKE</Text>
          </Pressable>
          {!isReply ? (
            <Pressable onPress={() => onReply?.(comment)}>
              <Text style={styles.action}>REPLY</Text>
            </Pressable>
          ) : null}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: S.md,
  },
  reply: {
    marginLeft: S.x5,
  },
  body: {
    flex: 1,
    gap: S.xs,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: S.sm,
  },
  username: {
    color: Colors.textPrimary,
    fontFamily: F.family.bodySemi,
    fontSize: F.size.sm,
  },
  time: {
    color: Colors.textMuted,
    fontFamily: F.family.monoMedium,
    fontSize: F.size.xs,
  },
  text: {
    color: Colors.textSecondary,
    fontFamily: F.family.bodyRegular,
    fontSize: F.size.base,
    lineHeight: F.size.base * F.lineHeight.normal,
  },
  actions: {
    flexDirection: 'row',
    gap: S.lg,
  },
  action: {
    color: Colors.accentVolt,
    fontFamily: F.family.monoBold,
    fontSize: F.size.xs,
  },
});
