import { StyleSheet, Text, View } from 'react-native';

import { colors } from '@/constants/colors';
import { fontFamily, radius } from '@/constants/typography';
import { formatPercent } from '@/utils/formatters';

type VoteBarProps = {
  votesYes: number;
  votesNo: number;
};

export function VoteBar({ votesYes, votesNo }: VoteBarProps) {
  const total = votesYes + votesNo;
  const yesRatio = total > 0 ? votesYes / total : 0;
  const yesPercent = formatPercent(votesYes, total);

  return (
    <View style={styles.wrap}>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${Math.max(3, yesRatio * 100)}%` }]} />
      </View>
      <Text style={styles.label}>{yesPercent} YES</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 8,
  },
  track: {
    height: 12,
    borderRadius: radius.sm,
    overflow: 'hidden',
    backgroundColor: colors.textGhost,
    borderWidth: 1,
    borderColor: colors.stroke,
  },
  fill: {
    height: '100%',
    backgroundColor: colors.volt,
  },
  label: {
    alignSelf: 'flex-end',
    color: colors.textMuted,
    fontFamily: fontFamily.monoBold,
    fontSize: 11,
  },
});
