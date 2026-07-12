import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { Colors, F } from '@/constants/tokens';
import { useNow } from '@/hooks/useNow';
import { formatCountdownShort, getCountdownProgress, isExpiringSoon } from '@/utils/countdown';

type CountdownRingProps = {
  expiresAt: Date;
  size?: number;
  strokeWidth?: number;
};

export function CountdownRing({ expiresAt, size = 44, strokeWidth = 4 }: CountdownRingProps) {
  const now = useNow();
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const progress = getCountdownProgress(expiresAt, now);
  const urgent = isExpiringSoon(expiresAt, now);

  return (
    <View style={[styles.wrap, { width: size, height: size }]}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <Circle cx={size / 2} cy={size / 2} r={radius} stroke={Colors.strokeStrong} strokeWidth={strokeWidth} fill="none" />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={urgent ? Colors.accentFire : Colors.accentVolt}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={circumference - progress * circumference}
          strokeLinecap="round"
          rotation="-90"
          originX={size / 2}
          originY={size / 2}
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
    color: Colors.textPrimary,
    fontFamily: F.family.monoBold,
    fontSize: F.size.micro,
  },
});
