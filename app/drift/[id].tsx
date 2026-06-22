import { Share, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Share2, Upload } from 'lucide-react-native';

import { CountdownRing } from '@/components/drift/CountdownRing';
import { ProofMedia } from '@/components/drift/ProofMedia';
import { VoteBar } from '@/components/drift/VoteBar';
import { VoteButtons } from '@/components/drift/VoteButtons';
import { AppHeader } from '@/components/layout/AppHeader';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { colors } from '@/constants/colors';
import { fontFamily, radius } from '@/constants/typography';
import { useDrift } from '@/hooks/useDrift';
import { useVote } from '@/hooks/useVote';
import type { DriftStatus } from '@/types/drift';
import { formatCategory, formatDateTime } from '@/utils/formatters';

function statusCopy(status: DriftStatus, username: string): string | null {
  switch (status) {
    case 'decided':
      return `Voting closed. Waiting for proof from @${username}...`;
    case 'executed':
      return 'Proof uploaded. Commitment completed.';
    case 'failed':
      return "Author didn't deliver. Reputation hit taken.";
    case 'active':
    default:
      return null;
  }
}

export default function DriftDetailScreen() {
  const params = useLocalSearchParams<{ id?: string }>();
  const router = useRouter();
  const driftId = typeof params.id === 'string' ? params.id : undefined;
  const driftState = useDrift(driftId);
  const vote = useVote(driftState.drift);

  if (driftState.loading) {
    return (
      <ScreenWrapper showTabs>
        <Spinner />
      </ScreenWrapper>
    );
  }

  if (driftState.error || !driftState.drift) {
    return (
      <ScreenWrapper showTabs>
        <View style={styles.state}>
          <Text style={styles.stateTitle}>Drift not found.</Text>
          <Text style={styles.stateCopy}>{driftState.error ?? 'This drift may have been deleted.'}</Text>
          <Button label="Back to feed" variant="primary" onPress={() => router.replace('/feed')} />
        </View>
      </ScreenWrapper>
    );
  }

  const drift = driftState.drift;
  const bannerCopy = statusCopy(drift.status, drift.authorUsername);

  const shareDrift = async () => {
    await Share.share({
      message: `Vote on this DRIFT: ${drift.text}`,
    });
  };

  return (
    <ScreenWrapper showTabs scroll>
      <AppHeader
        title="Drift"
        eyebrow={formatDateTime(drift.createdAt)}
        action={
          <Button
            label="Share"
            variant="ghost"
            onPress={shareDrift}
            leftIcon={<Share2 size={16} color={colors.textPrimary} />}
          />
        }
      />

      <View style={styles.detail}>
        <View style={styles.authorRow}>
          <Text style={styles.author}>@{drift.authorUsername}</Text>
          <Badge label={formatCategory(drift.category)} tone="neutral" />
        </View>

        <Text style={styles.text}>{drift.text}</Text>
        <Text style={styles.stake}>If YES wins, I will {drift.stake}</Text>

        <View style={styles.ringWrap}>
          <CountdownRing expiresAt={drift.expiresAt} size={120} strokeWidth={10} showLabel />
        </View>

        <VoteBar votesYes={drift.votesYes} votesNo={drift.votesNo} />
        <VoteButtons
          votesYes={drift.votesYes}
          votesNo={drift.votesNo}
          currentVote={vote.currentVote}
          canVote={vote.canVote}
          loadingVote={vote.loadingVote}
          onVote={vote.vote}
        />
        {vote.error ? <Text style={styles.error}>{vote.error}</Text> : null}

        {bannerCopy ? (
          <View style={styles.banner}>
            <Text style={styles.bannerText}>{bannerCopy}</Text>
          </View>
        ) : null}

        {driftState.canUploadProof ? (
          <Button
            label="Upload proof"
            variant="primary"
            fullWidth
            leftIcon={<Upload size={16} color={colors.base} />}
            onPress={() => router.push({ pathname: '/modal/proof-upload', params: { driftId: drift.id } })}
          />
        ) : null}

        {drift.proofUrl ? <ProofMedia url={drift.proofUrl} uploadedAt={drift.proofUploadedAt} /> : null}
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  detail: {
    gap: 18,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  author: {
    color: colors.textPrimary,
    fontFamily: fontFamily.bodySemiBold,
    fontSize: 14,
  },
  text: {
    color: colors.textPrimary,
    fontFamily: fontFamily.displayBold,
    fontSize: 34,
    lineHeight: 39,
  },
  stake: {
    color: colors.textMuted,
    fontFamily: fontFamily.bodyMedium,
    fontSize: 16,
    lineHeight: 23,
  },
  ringWrap: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  banner: {
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.stroke,
    backgroundColor: colors.elevated,
    padding: 14,
  },
  bannerText: {
    color: colors.textPrimary,
    fontFamily: fontFamily.bodySemiBold,
    fontSize: 14,
    lineHeight: 20,
  },
  error: {
    color: colors.fire,
    fontFamily: fontFamily.bodyMedium,
    fontSize: 13,
  },
  state: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-start',
    gap: 10,
  },
  stateTitle: {
    color: colors.textPrimary,
    fontFamily: fontFamily.displayBold,
    fontSize: 26,
  },
  stateCopy: {
    color: colors.textMuted,
    fontFamily: fontFamily.body,
    fontSize: 14,
  },
});
