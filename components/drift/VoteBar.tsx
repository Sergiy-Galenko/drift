import { StyleSheet, Text, View } from 'react-native';

import { Colors, F, R, S } from '@/constants/tokens';
import type { Drift } from '@/types/drift';
import { isBinaryPoll } from '@/utils/poll';

type VoteBarProps = {
  drift: Drift;
};

export function VoteBar({ drift }: VoteBarProps) {
  const { votesYes, votesNo } = drift;
  const total = votesYes + votesNo;
  const yesPercent = total > 0 ? votesYes / total : 0.5;
  const noPercent = 1 - yesPercent;

  if (!isBinaryPoll(drift)) {
    const options = drift.pollOptions ?? [];
    const totalTallies = options.reduce((sum, option) => sum + (drift.optionTallies?.[option.id] ?? 0), 0);
    return (
      <View style={styles.customWrap}>
        {options.map((option) => {
          const tally = drift.optionTallies?.[option.id] ?? 0;
          const percent = totalTallies > 0 ? tally / totalTallies : 0;
          return (
            <View key={option.id} style={styles.optionRow}>
              <View style={styles.optionLabels}>
                <Text numberOfLines={1} style={styles.optionLabel}>{option.label}</Text>
                <Text style={styles.optionCount}>{drift.pollType === 'ranking' ? `${tally} pts` : `${tally} votes`}</Text>
              </View>
              <View style={styles.track}><View style={[styles.optionFill, { flex: Math.max(0.02, percent) }]} /><View style={{ flex: Math.max(0.02, 1 - percent) }} /></View>
            </View>
          );
        })}
      </View>
    );
  }

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
  customWrap: {
    gap: S.sm,
  },
  optionRow: {
    gap: S.xs,
  },
  optionLabels: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: S.sm,
  },
  optionLabel: {
    flex: 1,
    color: Colors.textSecondary,
    fontFamily: F.family.bodySemi,
    fontSize: F.size.xs,
  },
  optionCount: {
    color: Colors.accentVolt,
    fontFamily: F.family.monoBold,
    fontSize: F.size.xs,
  },
  optionFill: {
    backgroundColor: Colors.accentVolt,
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
