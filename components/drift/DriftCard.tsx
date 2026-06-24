import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  interpolateColor,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { CountdownRing } from './CountdownRing';
import { StatusBanner } from './StatusBanner';
import { VoteBar } from './VoteBar';
import { VoteButtons } from './VoteButtons';
import { BookmarkIcon, CommentIcon, HeartIcon, MoreIcon, PaperPlaneIcon } from '@/components/icons';
import { Avatar } from '@/components/ui/Avatar';
import { Colors, F, S } from '@/constants/tokens';
import { useVote } from '@/hooks/useVote';
import type { Drift, DriftVote } from '@/types/drift';
import { formatVoteCount } from '@/utils/formatters';

type DriftCardProps = {
  drift: Drift;
  index?: number;
  preview?: boolean;
};

function DriftCardComponent({ drift, preview = false }: DriftCardProps) {
  const router = useRouter();
  const vote = useVote(preview ? null : drift);
  const translateX = useSharedValue(0);

  const animatedCard = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));
  const overlayStyle = useAnimatedStyle(() => ({
    opacity: Math.min(0.18, Math.abs(translateX.value) / 280),
    backgroundColor: interpolateColor(translateX.value, [-120, 0, 120], [Colors.fire, Colors.black, Colors.volt]),
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
      <Animated.View style={[styles.post, animatedCard]}>
        <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, overlayStyle]} />
        <Pressable disabled={preview} onPress={openDrift} style={styles.pressArea}>
          <View style={styles.header}>
            <View style={styles.authorRow}>
              <Avatar username={drift.authorUsername} avatarUrl={null} reputationScore={drift.authorReputationScore} size={32} />
              <View style={styles.authorWrap}>
                <Text style={styles.author}>@{drift.authorUsername}</Text>
                <Text style={styles.rep}>{drift.authorReputationScore} rep</Text>
              </View>
            </View>
            <View style={styles.headerRight}>
              <CountdownRing expiresAt={drift.expiresAt} size={38} strokeWidth={3} />
              <MoreIcon size={22} color={Colors.white} />
            </View>
          </View>

          <View style={styles.media}>
            <Text style={styles.category}>{drift.category}</Text>
            <Text style={styles.text}>{drift.text}</Text>
            {drift.context ? <Text style={styles.context}>{drift.context}</Text> : null}
          </View>
        </Pressable>

        <View style={styles.actions}>
          <View style={styles.actionLeft}>
            <HeartIcon size={25} color={Colors.white} />
            <CommentIcon size={24} color={Colors.white} />
            <PaperPlaneIcon size={24} color={Colors.white} />
          </View>
          <BookmarkIcon size={24} color={Colors.white} />
        </View>

        <View style={styles.metaBlock}>
          <Text style={styles.voteCount}>{formatVoteCount(drift.votesYes + drift.votesNo)} votes</Text>
          <Text style={styles.caption}>
            <Text style={styles.captionUser}>@{drift.authorUsername} </Text>
            {drift.stake}
          </Text>
          <StatusBanner drift={drift} />
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
  post: {
    overflow: 'hidden',
    borderBottomWidth: S.px,
    borderBottomColor: Colors.separator,
    backgroundColor: Colors.black,
  },
  pressArea: {
    gap: 0,
  },
  header: {
    height: 48,
    paddingHorizontal: S.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: S.md,
  },
  authorRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: S.sm,
  },
  authorWrap: {
    flex: 1,
    gap: 1,
  },
  author: {
    color: Colors.textPrimary,
    fontFamily: F.family.bodySemi,
    fontSize: 13,
  },
  rep: {
    color: Colors.textTertiary,
    fontFamily: F.family.bodyRegular,
    fontSize: F.size.xs,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: S.md,
  },
  media: {
    minHeight: 360,
    justifyContent: 'center',
    gap: S.md,
    backgroundColor: Colors.surface,
    paddingHorizontal: S.lg,
    paddingVertical: S.x3,
  },
  category: {
    color: Colors.volt,
    fontFamily: F.family.bodySemi,
    fontSize: F.size.xs,
    textTransform: 'uppercase',
  },
  text: {
    color: Colors.textPrimary,
    fontFamily: F.family.displayBlack,
    fontSize: 30,
    lineHeight: 35,
  },
  context: {
    color: Colors.textSecondary,
    fontFamily: F.family.bodyRegular,
    fontSize: F.size.base,
    lineHeight: F.size.base * F.lineHeight.normal,
  },
  actions: {
    minHeight: 42,
    paddingHorizontal: S.md,
    paddingTop: S.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  actionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: S.lg,
  },
  metaBlock: {
    paddingHorizontal: S.md,
    paddingBottom: S.lg,
    gap: S.sm,
  },
  voteCount: {
    color: Colors.white,
    fontFamily: F.family.bodySemi,
    fontSize: F.size.sm,
  },
  caption: {
    color: Colors.white,
    fontFamily: F.family.bodyRegular,
    fontSize: F.size.base,
    lineHeight: F.size.base * F.lineHeight.normal,
  },
  captionUser: {
    fontFamily: F.family.bodySemi,
  },
});
