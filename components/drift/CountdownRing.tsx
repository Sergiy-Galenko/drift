import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { Colors, F } from '@/constants/tokens';
import { formatCountdownShort, getCountdownProgress, isExpiringSoon } from '@/utils/countdown';

type CountdownRingProps = {
  expiresAt: Date;
  size?: number;
  strokeWidth?: number;
};

export function CountdownRing({ expiresAt, size = 44, strokeWidth = 4 }: CountdownRingProps) {
  const [now, setNow] = useState(Date.now());
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const progress = getCountdownProgress(expiresAt);
  const urgent = isExpiringSoon(expiresAt);

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

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
      <Text key={now} style={styles.text}>{formatCountdownShort(expiresAt)}</Text>
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
