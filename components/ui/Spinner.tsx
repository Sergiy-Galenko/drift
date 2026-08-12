import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { Colors, S } from '@/constants/tokens';
import { useTranslation } from '@/hooks/useTranslation';

type SpinnerProps = {
  label?: string;
  inline?: boolean;
  size?: 'small' | 'large';
  color?: string;
};

export function Spinner({ label, inline = false, size = 'small', color = Colors.accentVolt }: SpinnerProps) {
  const { t } = useTranslation();
  return (
    <View accessibilityLabel={label ? t(label) : undefined} style={[styles.wrap, inline ? styles.inlineWrap : null]}>
      <ActivityIndicator color={color} size={size} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: S.lg,
  },
  inlineWrap: {
    padding: 0,
  },
});
