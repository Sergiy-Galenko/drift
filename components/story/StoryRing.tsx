import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { Colors, S } from '@/constants/tokens';

type StoryRingProps = {
  size: number;
  seen?: boolean;
  children: ReactNode;
};

export function StoryRing({ size, seen = false, children }: StoryRingProps) {
  return (
    <LinearGradient
      colors={
        seen
          ? [Colors.separatorStrong, Colors.separatorStrong]
          : [Colors.storyGrad1, Colors.storyGrad2, Colors.storyGrad3, Colors.storyGrad4]
      }
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.ring, { width: size, height: size, borderRadius: size / 2 }]}
    >
      <View style={[styles.inner, { borderRadius: size / 2 }]}>{children}</View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  ring: {
    padding: 2,
  },
  inner: {
    flex: 1,
    padding: S.px * 2,
    backgroundColor: Colors.black,
  },
});
