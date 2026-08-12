import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withSpring, withTiming } from 'react-native-reanimated';

import { Colors, F, R, S } from '@/constants/tokens';

type StampTone = 'neutral' | 'ledger' | 'oxblood' | 'blue' | 'wax' | 'gold';

type InkStampProps = {
  label: string;
  tone?: StampTone;
  compact?: boolean;
};

const tones: Record<StampTone, string> = {
  neutral: Colors.slate,
  ledger: Colors.ledger,
  oxblood: Colors.oxblood,
  blue: Colors.blueInk,
  wax: Colors.purpleWax,
  gold: Colors.goldFoil,
};

/** The one deliberately emphatic motion in the Dossier UI. */
export function InkStamp({ label, tone = 'neutral', compact = false }: InkStampProps) {
  const scale = useSharedValue(1.18);
  const opacity = useSharedValue(0);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 180 });
    scale.value = withSequence(
      withTiming(0.86, { duration: 180 }),
      withSpring(1, { damping: 19, stiffness: 260 }),
    );
  }, [label, opacity, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ rotate: '-2deg' }, { scale: scale.value }],
  }));

  return (
    <Animated.View style={[styles.wrap, compact ? styles.compact : null, { borderColor: tones[tone] }, animatedStyle]}>
      <View style={[styles.inner, { borderColor: tones[tone] }]}>
        <Text numberOfLines={1} style={[styles.label, compact ? styles.compactLabel : null, { color: tones[tone] }]}>{label}</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignSelf: 'flex-start',
    borderWidth: 2,
    borderRadius: R.xs,
    padding: 2,
  },
  inner: {
    borderWidth: S.px,
    borderRadius: 2,
    paddingHorizontal: S.sm,
    paddingVertical: S.xs,
  },
  compact: {
    borderWidth: S.px,
    padding: 1,
  },
  label: {
    fontFamily: F.family.displayBold,
    fontSize: F.size.sm,
    letterSpacing: 0.8,
  },
  compactLabel: {
    fontSize: F.size.micro,
    letterSpacing: 0.5,
  },
});
