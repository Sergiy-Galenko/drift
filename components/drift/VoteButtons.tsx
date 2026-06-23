import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { CheckIcon, XIcon } from '@/components/icons';
import { Spinner } from '@/components/ui/Spinner';
import { Colors, F, R, S } from '@/constants/tokens';
import type { DriftVote } from '@/types/drift';

type VoteButtonsProps = {
  currentVote: DriftVote | null;
  canVote: boolean;
  loadingVote: DriftVote | null;
  onVote: (vote: DriftVote) => void;
};

export function VoteButtons({ currentVote, canVote, loadingVote, onVote }: VoteButtonsProps) {
  const yesScale = useSharedValue(1);
  const noScale = useSharedValue(1);

  const yesStyle = useAnimatedStyle(() => ({ transform: [{ scale: yesScale.value }] }));
  const noStyle = useAnimatedStyle(() => ({ transform: [{ scale: noScale.value }] }));

  const press = (direction: DriftVote) => {
    if (!canVote) return;
    const target = direction === 'yes' ? yesScale : noScale;
    target.value = withSpring(0.96, { damping: 14 }, () => {
      target.value = withSpring(1, { damping: 14 });
    });
    onVote(direction);
  };

  return (
    <View style={styles.row}>
      <Animated.View style={[styles.flex, yesStyle]}>
        <Pressable
          accessibilityRole="button"
          disabled={!canVote}
          onPress={() => press('yes')}
          style={({ pressed }) => [
            styles.button,
            styles.yes,
            currentVote === 'yes' ? styles.yesActive : null,
            pressed && canVote ? styles.pressed : null,
            !canVote ? styles.disabled : null,
          ]}
        >
          {loadingVote === 'yes' ? <Spinner /> : <CheckIcon color={Colors.voteYes} size={18} />}
          <Text style={styles.yesText}>YES</Text>
        </Pressable>
      </Animated.View>
      <Animated.View style={[styles.flex, noStyle]}>
        <Pressable
          accessibilityRole="button"
          disabled={!canVote}
          onPress={() => press('no')}
          style={({ pressed }) => [
            styles.button,
            styles.no,
            currentVote === 'no' ? styles.noActive : null,
            pressed && canVote ? styles.pressed : null,
            !canVote ? styles.disabled : null,
          ]}
        >
          {loadingVote === 'no' ? <Spinner /> : <XIcon color={Colors.voteNo} size={18} />}
          <Text style={styles.noText}>NO</Text>
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: S.md,
  },
  flex: {
    flex: 1,
  },
  button: {
    minHeight: S.x6,
    borderRadius: R.md,
    borderWidth: S.px,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: S.sm,
  },
  yes: {
    backgroundColor: Colors.bgInteractive,
    borderColor: Colors.voteYes,
  },
  no: {
    backgroundColor: Colors.bgInteractive,
    borderColor: Colors.voteNo,
  },
  yesActive: {
    backgroundColor: Colors.bgElevated,
  },
  noActive: {
    backgroundColor: Colors.bgElevated,
  },
  pressed: {
    opacity: 0.82,
  },
  disabled: {
    opacity: 0.45,
  },
  yesText: {
    color: Colors.voteYes,
    fontFamily: F.family.monoBold,
    fontSize: F.size.base,
  },
  noText: {
    color: Colors.voteNo,
    fontFamily: F.family.monoBold,
    fontSize: F.size.base,
  },
});
