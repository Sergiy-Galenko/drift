import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { colors } from '@/constants/colors';

export function Spinner() {
  return (
    <View style={styles.wrap}>
      <ActivityIndicator color={colors.volt} size="small" />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 160,
  },
});
