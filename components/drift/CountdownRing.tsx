import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { LocalizedText as Text } from '@/components/ui/LocalizedText';
import Svg, { Circle } from 'react-native-svg';
import Animated, { interpolateColor, useAnimatedProps, useSharedValue, withTiming } from 'react-native-reanimated';

import { Colors, F } from '@/constants/tokens';
import { useNow } from '@/hooks/useNow';
import { formatCountdownShort, getCountdownProgress } from '@/utils/countdown';

type CountdownRingProps = {
  createdAt: Date;
  expiresAt: Date;
  size?: number;
  strokeWidth?: number;
};

export function CountdownRing({ createdAt, expiresAt, size = 44, strokeWidth = 4 }: CountdownRingProps) {
  const now = useNow();
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const progress = getCountdownProgress(createdAt, expiresAt, now);
  const urgency = useSharedValue(0);
  const urgencyProgress = Math.max(0, Math.min(1, (0.28 - progress) / 0.28));

  useEffect(() => {
    urgency.value = withTiming(urgencyProgress, { duration: 220 });
  }, [urgency, urgencyProgress]);

  const animatedProps = useAnimatedProps(() => ({
    stroke: interpolateColor(urgency.value, [0, 1], [Colors.slate, Colors.oxblood]),
  }));

  return (
    <View style={[styles.wrap, { width: size, height: size }]}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <Circle cx={size / 2} cy={size / 2} r={radius} stroke={Colors.paperLine} strokeWidth={strokeWidth} fill="none" />
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={Colors.slate}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={circumference - progress * circumference}
          strokeLinecap="round"
          rotation="-90"
          originX={size / 2}
          originY={size / 2}
          animatedProps={animatedProps}
        />
      </Svg>
      <Text style={styles.text}>{formatCountdownShort(expiresAt, now)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    position: 'absolute',
    color: Colors.ink,
    fontFamily: F.family.monoBold,
    fontSize: F.size.micro,
  },
});

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
