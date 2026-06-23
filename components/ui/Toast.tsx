import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Colors, F, R, S, Shadows } from '@/constants/tokens';
import { useUIStore, type ToastItem } from '@/stores/uiStore';

function toneStyle(tone: ToastItem['tone']) {
  switch (tone) {
    case 'success':
      return styles.success;
    case 'warning':
      return styles.warning;
    case 'danger':
      return styles.danger;
    case 'neutral':
      return styles.neutral;
  }
}

export function Toast() {
  const insets = useSafeAreaInsets();
  const queue = useUIStore((state) => state.toastQueue);
  const dismissToast = useUIStore((state) => state.dismissToast);
  const item = queue[0];

  useEffect(() => {
    if (!item) {
      return;
    }

    const timeout = setTimeout(() => dismissToast(item.id), 3200);
    return () => clearTimeout(timeout);
  }, [dismissToast, item]);

  if (!item) {
    return null;
  }

  return (
    <View pointerEvents="none" style={[styles.wrap, { paddingTop: insets.top + S.md }]}>
      <View style={[styles.toast, toneStyle(item.tone)]}>
        <Text style={styles.title}>{item.title}</Text>
        {item.message ? <Text style={styles.message}>{item.message}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 30,
    paddingHorizontal: S.lg,
  },
  toast: {
    borderRadius: R.md,
    borderWidth: S.px,
    backgroundColor: Colors.bgElevated,
    padding: S.lg,
    gap: S.xs,
    ...Shadows.card,
  },
  success: {
    borderColor: Colors.accentIce,
  },
  warning: {
    borderColor: Colors.accentAmber,
  },
  danger: {
    borderColor: Colors.accentFire,
  },
  neutral: {
    borderColor: Colors.strokeStrong,
  },
  title: {
    color: Colors.textPrimary,
    fontFamily: F.family.bodySemi,
    fontSize: F.size.base,
  },
  message: {
    color: Colors.textSecondary,
    fontFamily: F.family.bodyRegular,
    fontSize: F.size.sm,
  },
});
