import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';

import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Colors, S } from '@/constants/tokens';

export default function NotFoundScreen() {
  const router = useRouter();
  return (
    <View style={styles.wrap}>
      <EmptyState title="404" message="This drift slipped out of range." />
      <Button label="Back to feed" onPress={() => router.replace('/(tabs)/feed')} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    backgroundColor: Colors.bgBase,
    justifyContent: 'center',
    padding: S.x2,
    gap: S.lg,
  },
});
