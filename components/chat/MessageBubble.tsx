import { StyleSheet, Text, View } from 'react-native';

import { Colors, F, R, S } from '@/constants/tokens';
import type { ChatMessage } from '@/types/message';
import { formatAbsoluteTime } from '@/utils/formatters';

type MessageBubbleProps = {
  message: ChatMessage;
  isOwn: boolean;
};

export function MessageBubble({ message, isOwn }: MessageBubbleProps) {
  return (
    <View style={[styles.row, isOwn ? styles.rowOwn : null]}>
      <View style={[styles.bubble, isOwn ? styles.bubbleOwn : styles.bubbleOther]}>
        <Text style={[styles.text, isOwn ? styles.textOwn : null]}>{message.text ?? ''}</Text>
      </View>
      <Text style={styles.time}>{formatAbsoluteTime(message.createdAt)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    alignItems: 'flex-start',
    gap: S.xs,
  },
  rowOwn: {
    alignItems: 'flex-end',
  },
  bubble: {
    maxWidth: '82%',
    paddingHorizontal: S.md,
    paddingVertical: S.sm,
    borderRadius: R.lg,
  },
  bubbleOwn: {
    backgroundColor: Colors.blue,
    borderBottomRightRadius: R.xs,
  },
  bubbleOther: {
    backgroundColor: Colors.surfaceRaised,
    borderBottomLeftRadius: R.xs,
  },
  text: {
    color: Colors.textPrimary,
    fontFamily: F.family.bodyRegular,
    fontSize: F.size.base,
    lineHeight: F.size.base * F.lineHeight.normal,
  },
  textOwn: {
    color: Colors.white,
  },
  time: {
    color: Colors.textTertiary,
    fontFamily: F.family.bodyRegular,
    fontSize: F.size.xs,
  },
});
