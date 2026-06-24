import { StyleSheet, Text, View } from 'react-native';

import { Colors, F, R, S } from '@/constants/tokens';

type VoteBarProps = {
  votesYes: number;
  votesNo: number;
};

export function VoteBar({ votesYes, votesNo }: VoteBarProps) {
  const total = votesYes + votesNo;
  const yesPercent = total > 0 ? votesYes / total : 0.5;
  const noPercent = 1 - yesPercent;

  return (
    <View style={styles.wrap}>
      <View style={styles.track}>
        <View style={[styles.yesFill, { flex: Math.max(0.02, yesPercent) }]} />
        <View style={[styles.noFill, { flex: Math.max(0.02, noPercent) }]} />
      </View>
      <View style={styles.labels}>
        <Text style={styles.yes}>{Math.round(yesPercent * 100)}% YES</Text>
        <Text style={styles.no}>{Math.round(noPercent * 100)}% NO</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: S.sm,
  },
  track: {
    height: S.md,
    overflow: 'hidden',
    borderRadius: R.pill,
    backgroundColor: Colors.bgInteractive,
    flexDirection: 'row',
  },
  yesFill: {
    backgroundColor: Colors.voteYes,
  },
  noFill: {
    backgroundColor: Colors.voteNo,
  },
  labels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  yes: {
    color: Colors.voteYes,
    fontFamily: F.family.monoBold,
    fontSize: F.size.xs,
  },
  no: {
    color: Colors.voteNo,
    fontFamily: F.family.monoBold,
    fontSize: F.size.xs,
  },
});
