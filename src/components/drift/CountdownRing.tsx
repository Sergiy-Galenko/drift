import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import Animated, {
  Easing,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { colors } from '@/constants/colors';
import { fontFamily } from '@/constants/typography';
import { countdownProgress, formatRemaining, isUnderOneHour, remainingMs } from '@/utils/countdown';

type CountdownRingProps = {
  expiresAt: Date;
  size: number;
  strokeWidth: number;
  showLabel?: boolean;
};

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export function CountdownRing({ expiresAt, size, strokeWidth, showLabel = false }: CountdownRingProps) {
  const [label, setLabel] = useState(formatRemaining(expiresAt));
  const [urgent, setUrgent] = useState(isUnderOneHour(expiresAt));
  const progress = useSharedValue(countdownProgress(expiresAt));
  const pulse = useSharedValue(1);

  const ring = useMemo(() => {
    const radius = (size - strokeWidth) / 2;
    return {
      radius,
      circumference: 2 * Math.PI * radius,
      center: size / 2,
    };
  }, [size, strokeWidth]);

  useEffect(() => {
    const update = () => {
      setLabel(formatRemaining(expiresAt));
      setUrgent(isUnderOneHour(expiresAt));
      progress.value = withTiming(countdownProgress(expiresAt), {
        duration: 300,
        easing: Easing.out(Easing.cubic),
      });
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [expiresAt, progress]);

  useEffect(() => {
    if (urgent && remainingMs(expiresAt) > 0) {
      pulse.value = withRepeat(withSequence(withTiming(1.04, { duration: 650 }), withTiming(1, { duration: 650 })), -1, false);
      return;
    }

    pulse.value = withTiming(1, { duration: 150 });
  }, [expiresAt, pulse, urgent]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: ring.circumference * (1 - progress.value),
  }));

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));

  const stroke = urgent ? colors.fire : colors.volt;

  return (
    <Animated.View style={[styles.wrap, { width: size, height: size }, pulseStyle]}>
      <Svg width={size} height={size}>
        <Circle
          cx={ring.center}
          cy={ring.center}
          r={ring.radius}
          stroke={colors.stroke}
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        <AnimatedCircle
          cx={ring.center}
          cy={ring.center}
          r={ring.radius}
          stroke={stroke}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={`${ring.circumference} ${ring.circumference}`}
          strokeLinecap="butt"
          origin={`${ring.center}, ${ring.center}`}
          rotation="-90"
          animatedProps={animatedProps}
        />
      </Svg>
      {showLabel ? (
        <View style={styles.labelWrap}>
          <Text style={[styles.label, { color: stroke }]}>{label}</Text>
        </View>
      ) : null}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  labelWrap: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontFamily: fontFamily.monoBold,
    fontSize: 12,
  },
});
