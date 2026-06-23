import { StyleSheet, View, type DimensionValue } from 'react-native';

import { Colors, R, S } from '@/constants/tokens';

type ProgressBarProps = {
  progress: number;
  tone?: 'volt' | 'ice' | 'fire' | 'amber';
};

export function ProgressBar({ progress, tone = 'volt' }: ProgressBarProps) {
  const width = `${Math.max(0, Math.min(1, progress)) * 100}%` as DimensionValue;
  return (
    <View style={styles.track}>
      <View style={[styles.fill, styles[tone], { width }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: S.sm,
    borderRadius: R.pill,
    overflow: 'hidden',
    backgroundColor: Colors.bgInteractive,
  },
  fill: {
    height: '100%',
    borderRadius: R.pill,
  },
  volt: {
    backgroundColor: Colors.accentVolt,
  },
  ice: {
    backgroundColor: Colors.accentIce,
  },
  fire: {
    backgroundColor: Colors.accentFire,
  },
  amber: {
    backgroundColor: Colors.accentAmber,
  },
});
