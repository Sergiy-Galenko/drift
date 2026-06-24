import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Avatar } from '@/components/ui/Avatar';
import { Colors, F, R, S } from '@/constants/tokens';
import type { ConversationPreview } from '@/types/message';
import { formatRelativeTime } from '@/utils/formatters';

type ConversationRowProps = {
  conversation: ConversationPreview;
  onPress: () => void;
};

export function ConversationRow({ conversation, onPress }: ConversationRowProps) {
  const otherUser = conversation.otherUser;

  return (
    <Pressable onPress={onPress} style={styles.row}>
      <Avatar
        username={otherUser?.username ?? 'user'}
        avatarUrl={otherUser?.avatarUrl ?? null}
        reputationScore={otherUser?.reputationScore ?? 50}
        size={48}
      />
      <View style={styles.body}>
        <Text style={styles.username}>@{otherUser?.username ?? 'unknown'}</Text>
        <Text numberOfLines={1} style={[styles.message, conversation.unread > 0 ? styles.messageUnread : null]}>
          {conversation.lastMessage ?? 'No messages yet'}
        </Text>
      </View>
      <View style={styles.meta}>
        <Text style={styles.time}>{conversation.lastMessageAt ? formatRelativeTime(conversation.lastMessageAt) : ''}</Text>
        {conversation.unread > 0 ? (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{conversation.unread > 9 ? '9+' : conversation.unread}</Text>
          </View>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: S.md,
    paddingHorizontal: S.lg,
    paddingVertical: S.md,
  },
  body: {
    flex: 1,
    gap: 2,
  },
  username: {
    color: Colors.textPrimary,
    fontFamily: F.family.bodySemi,
    fontSize: F.size.base,
  },
  message: {
    color: Colors.textSecondary,
    fontFamily: F.family.bodyRegular,
    fontSize: F.size.sm,
  },
  messageUnread: {
    color: Colors.textPrimary,
    fontFamily: F.family.bodySemi,
  },
  meta: {
    alignItems: 'flex-end',
    gap: S.xs,
    minWidth: 54,
  },
  time: {
    color: Colors.textTertiary,
    fontFamily: F.family.bodyRegular,
    fontSize: F.size.xs,
  },
  badge: {
    minWidth: 22,
    height: 22,
    borderRadius: R.pill,
    paddingHorizontal: S.xs,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.blue,
  },
  badgeText: {
    color: Colors.white,
    fontFamily: F.family.bodySemi,
    fontSize: F.size.xs,
  },
});
