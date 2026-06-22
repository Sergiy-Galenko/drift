import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { colors } from '@/constants/colors';
import { fontFamily } from '@/constants/typography';
import { reputationColor } from '@/utils/reputation';

type ReputationRingProps = {
  score: number;
  size?: number;
};

export function ReputationRing({ score, size = 108 }: ReputationRingProps) {
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.max(0, Math.min(100, score)) / 100;
  const stroke = reputationColor(score);

  return (
    <View style={[styles.wrap, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={colors.stroke}
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={stroke}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={circumference * (1 - progress)}
          strokeLinecap="butt"
          origin={`${size / 2}, ${size / 2}`}
          rotation="-90"
        />
      </Svg>
      <View style={styles.center}>
        <Text style={[styles.score, { color: stroke }]}>{score}</Text>
        <Text style={styles.label}>REP</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  score: {
    fontFamily: fontFamily.monoBold,
    fontSize: 28,
  },
  label: {
    color: colors.textMuted,
    fontFamily: fontFamily.mono,
    fontSize: 10,
  },
});
