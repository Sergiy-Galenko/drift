import { StyleSheet, Text, View } from 'react-native';

import { Colors, F, S } from '@/constants/tokens';

type EmptyStateProps = {
  title: string;
  message: string;
};

export function EmptyState({ title, message }: EmptyStateProps) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: S.x4,
    gap: S.sm,
  },
  title: {
    color: Colors.textPrimary,
    fontFamily: F.family.displayBold,
    fontSize: F.size.xl,
    textAlign: 'center',
  },
  message: {
    color: Colors.textSecondary,
    fontFamily: F.family.bodyRegular,
    fontSize: F.size.base,
    lineHeight: F.size.base * F.lineHeight.normal,
    textAlign: 'center',
  },
});
