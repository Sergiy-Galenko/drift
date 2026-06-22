import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withTiming } from 'react-native-reanimated';

import { Button } from '@/components/ui/Button';
import { colors } from '@/constants/colors';
import { fontFamily } from '@/constants/typography';
import type { DriftVote } from '@/types/drift';
import { formatCompactCount } from '@/utils/formatters';

type VoteButtonsProps = {
  votesYes: number;
  votesNo: number;
  currentVote: DriftVote | null;
  canVote: boolean;
  loadingVote: DriftVote | null;
  onVote: (vote: DriftVote) => void;
};

export function VoteButtons({ votesYes, votesNo, currentVote, canVote, loadingVote, onVote }: VoteButtonsProps) {
  const scale = useSharedValue(1);
  const selectedVote = currentVote;

  useEffect(() => {
    if (selectedVote) {
      scale.value = withSequence(withTiming(1.08, { duration: 110 }), withTiming(1, { duration: 110 }));
    }
  }, [scale, selectedVote]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={[styles.wrap, animatedStyle]}>
      <Button
        fullWidth
        label={`YES ${formatCompactCount(votesYes)}`}
        variant={selectedVote === 'yes' ? 'primary' : selectedVote ? 'ghost' : 'secondary'}
        disabled={!canVote || loadingVote !== null}
        loading={loadingVote === 'yes'}
        onPress={(event) => {
          event.stopPropagation();
          onVote('yes');
        }}
        style={styles.button}
      />
      <Button
        fullWidth
        label={`NO ${formatCompactCount(votesNo)}`}
        variant={selectedVote === 'no' ? 'danger' : selectedVote ? 'ghost' : 'secondary'}
        disabled={!canVote || loadingVote !== null}
        loading={loadingVote === 'no'}
        onPress={(event) => {
          event.stopPropagation();
          onVote('no');
        }}
        style={styles.button}
      />
      {!canVote && !selectedVote ? (
        <View style={styles.locked}>
          <Text style={styles.lockedText}>Voting locked</Text>
        </View>
      ) : null}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  button: {
    flex: 1,
  },
  locked: {
    position: 'absolute',
    right: 8,
    top: -18,
  },
  lockedText: {
    color: colors.textMuted,
    fontFamily: fontFamily.mono,
    fontSize: 10,
  },
});
