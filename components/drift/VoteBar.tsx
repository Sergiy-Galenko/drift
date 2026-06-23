import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

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
        <LinearGradient
          colors={[Colors.voteYes, Colors.voteNo]}
          locations={[Math.max(0.02, yesPercent), Math.min(0.98, yesPercent)]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.fill}
        />
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
  },
  fill: {
    flex: 1,
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
