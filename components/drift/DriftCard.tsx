import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  FadeInDown,
  interpolateColor,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { CategoryBadge } from './CategoryBadge';
import { CountdownRing } from './CountdownRing';
import { StatusBanner } from './StatusBanner';
import { VoteBar } from './VoteBar';
import { VoteButtons } from './VoteButtons';
import { Colors, F, R, S, Shadows } from '@/constants/tokens';
import { useVote } from '@/hooks/useVote';
import type { Drift, DriftVote } from '@/types/drift';

type DriftCardProps = {
  drift: Drift;
  index?: number;
  preview?: boolean;
};

function DriftCardComponent({ drift, index = 0, preview = false }: DriftCardProps) {
  const router = useRouter();
  const vote = useVote(preview ? null : drift);
  const translateX = useSharedValue(0);

  const animatedCard = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));
  const overlayStyle = useAnimatedStyle(() => ({
    opacity: Math.min(0.22, Math.abs(translateX.value) / 280),
    backgroundColor: interpolateColor(translateX.value, [-120, 0, 120], [Colors.voteNo, Colors.bgSurface, Colors.voteYes]),
  }));

  const submitSwipe = (direction: DriftVote) => {
    void vote.vote(direction);
  };

  const pan = Gesture.Pan()
    .enabled(vote.canVote)
    .onUpdate((event) => {
      translateX.value = Math.max(-120, Math.min(120, event.translationX * 0.45));
    })
    .onEnd(() => {
      if (translateX.value > 82) {
        runOnJS(submitSwipe)('yes');
      }
      if (translateX.value < -82) {
        runOnJS(submitSwipe)('no');
      }
      translateX.value = withSpring(0, { damping: 18 });
    });

  const openDrift = () => {
    if (!preview) {
      router.push({ pathname: '/(drift)/[id]', params: { id: drift.id } });
    }
  };

  return (
    <GestureDetector gesture={pan}>
      <Animated.View entering={index < 5 ? FadeInDown.duration(180).springify().damping(18) : undefined} style={[styles.card, animatedCard]}>
        <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, overlayStyle]} />
        <Pressable disabled={preview} onPress={openDrift} style={styles.pressArea}>
          <View style={styles.header}>
            <View style={styles.authorWrap}>
              <Text style={styles.author}>@{drift.authorUsername}</Text>
              <Text style={styles.rep}>{drift.authorReputationScore} REP</Text>
            </View>
            <CountdownRing expiresAt={drift.expiresAt} />
          </View>
          <CategoryBadge category={drift.category} />
          <Text style={styles.text}>{drift.text}</Text>
          {drift.context ? <Text style={styles.context}>{drift.context}</Text> : null}
          <Text style={styles.stake}>STAKE: {drift.stake}</Text>
          <StatusBanner drift={drift} />
        </Pressable>
        <View style={styles.voteArea}>
          <VoteBar votesYes={drift.votesYes} votesNo={drift.votesNo} />
          {!preview ? (
            <VoteButtons
              currentVote={vote.currentVote}
              canVote={vote.canVote}
              loadingVote={vote.loadingVote}
              onVote={vote.vote}
            />
          ) : null}
        </View>
      </Animated.View>
    </GestureDetector>
  );
}

export const DriftCard = memo(DriftCardComponent);

const styles = StyleSheet.create({
  card: {
    overflow: 'hidden',
    borderRadius: R.lg,
    borderWidth: S.px,
    borderColor: Colors.stroke,
    backgroundColor: Colors.bgSurface,
    padding: S.lg,
    gap: S.lg,
    ...Shadows.card,
  },
  pressArea: {
    gap: S.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: S.lg,
  },
  authorWrap: {
    flex: 1,
    gap: S.xs,
  },
  author: {
    color: Colors.textPrimary,
    fontFamily: F.family.bodySemi,
    fontSize: F.size.base,
  },
  rep: {
    color: Colors.textMuted,
    fontFamily: F.family.monoBold,
    fontSize: F.size.xs,
  },
  text: {
    color: Colors.textPrimary,
    fontFamily: F.family.displayBlack,
    fontSize: F.size.xl,
    lineHeight: F.size.xl * F.lineHeight.tight,
  },
  context: {
    color: Colors.textSecondary,
    fontFamily: F.family.bodyRegular,
    fontSize: F.size.base,
    lineHeight: F.size.base * F.lineHeight.normal,
  },
  stake: {
    color: Colors.accentAmber,
    fontFamily: F.family.monoBold,
    fontSize: F.size.sm,
    lineHeight: F.size.sm * F.lineHeight.normal,
  },
  voteArea: {
    gap: S.md,
  },
});
