import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { Colors, S } from '@/constants/tokens';

type StoryRingProps = {
  size: number;
  seen?: boolean;
  children: ReactNode;
};

export function StoryRing({ size, seen = false, children }: StoryRingProps) {
  return (
    <View style={[styles.ring, { width: size, height: size, borderRadius: size / 2, borderColor: seen ? Colors.slate : Colors.ledger }]}>
      <View style={[styles.inner, { borderRadius: size / 2 }]}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  ring: {
    padding: 2,
    borderWidth: S.px,
  },
  inner: {
    flex: 1,
    padding: S.px * 2,
    backgroundColor: Colors.wall,
  },
});
