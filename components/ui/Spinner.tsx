import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { Colors, S } from '@/constants/tokens';

type SpinnerProps = {
  label?: string;
};

export function Spinner({ label }: SpinnerProps) {
  return (
    <View accessibilityLabel={label} style={styles.wrap}>
      <ActivityIndicator color={Colors.accentVolt} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: S.lg,
  },
});
