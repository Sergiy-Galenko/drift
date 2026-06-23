import { useEffect } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import Animated, { interpolateColor, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { Colors, R, S } from '@/constants/tokens';

type SwitchProps = {
  value: boolean;
  onValueChange: (value: boolean) => void;
  label: string;
};

export function Switch({ value, onValueChange, label }: SwitchProps) {
  const progress = useSharedValue(value ? 1 : 0);

  useEffect(() => {
    progress.value = withSpring(value ? 1 : 0, { damping: 14 });
  }, [progress, value]);

  const trackStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(progress.value, [0, 1], [Colors.bgInteractive, Colors.accentVolt]),
  }));
  const knobStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: progress.value * 22 }],
  }));

  return (
    <Pressable accessibilityLabel={label} accessibilityRole="switch" accessibilityState={{ checked: value }} onPress={() => onValueChange(!value)}>
      <Animated.View style={[styles.track, trackStyle]}>
        <Animated.View style={[styles.knob, knobStyle]} />
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  track: {
    width: S.x6,
    height: S.x3,
    borderRadius: R.pill,
    borderWidth: S.px,
    borderColor: Colors.strokeStrong,
    padding: S.xs,
  },
  knob: {
    width: S.x2,
    height: S.x2,
    borderRadius: R.pill,
    backgroundColor: Colors.textPrimary,
  },
});
