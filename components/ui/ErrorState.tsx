import { StyleSheet, Text, View } from 'react-native';

import { Button } from './Button';
import { Colors, F, S } from '@/constants/tokens';

type ErrorStateProps = {
  title: string;
  message: string;
  onRetry?: () => void;
};

export function ErrorState({ title, message, onRetry }: ErrorStateProps) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      {onRetry ? <Button label="Retry" onPress={onRetry} variant="secondary" /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: S.x4,
    gap: S.lg,
  },
  title: {
    color: Colors.accentFire,
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
