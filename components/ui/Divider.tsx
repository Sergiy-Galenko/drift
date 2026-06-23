import { StyleSheet, View } from 'react-native';

import { Colors, S } from '@/constants/tokens';

export function Divider() {
  return <View style={styles.divider} />;
}

const styles = StyleSheet.create({
  divider: {
    height: S.px,
    backgroundColor: Colors.stroke,
  },
});
