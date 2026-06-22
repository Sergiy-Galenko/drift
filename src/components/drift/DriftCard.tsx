import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { Badge } from '@/components/ui/Badge';
import { CountdownRing } from '@/components/drift/CountdownRing';
import { VoteBar } from '@/components/drift/VoteBar';
import { VoteButtons } from '@/components/drift/VoteButtons';
import { colors } from '@/constants/colors';
import { fontFamily, radius } from '@/constants/typography';
import { useVote } from '@/hooks/useVote';
import type { Drift } from '@/types/drift';
import { formatCategory } from '@/utils/formatters';

type DriftCardProps = {
  drift: Drift;
  preview?: boolean;
  compact?: boolean;
};

export function DriftCard({ drift, preview = false, compact = false }: DriftCardProps) {
  const router = useRouter();
  const vote = useVote(preview ? null : drift);

  const openDrift = () => {
    if (preview) {
      return;
    }

    router.push({ pathname: '/drift/[id]', params: { id: drift.id } });
  };

  return (
    <Animated.View entering={FadeInDown.duration(180).springify().damping(18)} style={styles.card}>
      <Pressable onPress={openDrift} disabled={preview} style={styles.pressArea}>
        <View style={styles.header}>
          <View style={styles.authorRow}>
            <Text style={styles.author}>@{drift.authorUsername}</Text>
            <Badge label={formatCategory(drift.category)} tone="neutral" />
          </View>
          <CountdownRing expiresAt={drift.expiresAt} size={compact ? 34 : 40} strokeWidth={4} />
        </View>

        <Text style={[styles.text, compact ? styles.textCompact : null]}>{drift.text}</Text>
        <Text style={styles.stake}>If YES: {drift.stake}</Text>
      </Pressable>

      <View style={styles.voteArea}>
        <VoteBar votesYes={drift.votesYes} votesNo={drift.votesNo} />
        {!preview ? (
          <VoteButtons
            votesYes={drift.votesYes}
            votesNo={drift.votesNo}
            currentVote={vote.currentVote}
            canVote={vote.canVote}
            loadingVote={vote.loadingVote}
            onVote={vote.vote}
          />
        ) : null}
        {vote.error ? <Text style={styles.error}>{vote.error}</Text> : null}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.stroke,
    backgroundColor: colors.surface,
    padding: 16,
    gap: 16,
  },
  pressArea: {
    gap: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  authorRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  author: {
    color: colors.textPrimary,
    fontFamily: fontFamily.bodySemiBold,
    fontSize: 13,
  },
  text: {
    color: colors.textPrimary,
    fontFamily: fontFamily.displayBold,
    fontSize: 24,
    lineHeight: 29,
  },
  textCompact: {
    fontSize: 18,
    lineHeight: 23,
  },
  stake: {
    color: colors.textMuted,
    fontFamily: fontFamily.bodyMedium,
    fontSize: 14,
    lineHeight: 20,
  },
  voteArea: {
    gap: 12,
  },
  error: {
    color: colors.fire,
    fontFamily: fontFamily.bodyMedium,
    fontSize: 12,
  },
});
