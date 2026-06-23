import Svg, { Circle } from 'react-native-svg';

import { Colors } from '@/constants/tokens';
import { reputationColor } from '@/utils/reputation';

type ReputationRingProps = {
  score: number;
  size?: number;
  strokeWidth?: number;
};

export function ReputationRing({ score, size = 48, strokeWidth = 3 }: ReputationRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const progress = Math.max(0, Math.min(100, score)) / 100;

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <Circle cx={size / 2} cy={size / 2} r={radius} stroke={Colors.strokeStrong} strokeWidth={strokeWidth} fill="none" />
      <Circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke={reputationColor(score)}
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
  );
}
