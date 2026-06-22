import { useEffect } from 'react';
import { StyleSheet, Text } from 'react-native';
import Animated, { SlideInUp, SlideOutUp } from 'react-native-reanimated';

import { colors } from '@/constants/colors';
import { fontFamily, radius } from '@/constants/typography';

type ToastProps = {
  message: string | null;
  onDismiss: () => void;
};

export function Toast({ message, onDismiss }: ToastProps) {
  useEffect(() => {
    if (!message) {
      return;
    }

    const timeout = setTimeout(onDismiss, 2500);
    return () => clearTimeout(timeout);
  }, [message, onDismiss]);

  if (!message) {
    return null;
  }

  return (
    <Animated.View entering={SlideInUp.duration(160)} exiting={SlideOutUp.duration(140)} style={styles.toast}>
      <Text style={styles.text}>{message}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    top: 14,
    left: 16,
    right: 16,
    zIndex: 50,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.stroke,
    backgroundColor: colors.elevated,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  text: {
    color: colors.textPrimary,
    fontFamily: fontFamily.bodyMedium,
    fontSize: 13,
  },
});
