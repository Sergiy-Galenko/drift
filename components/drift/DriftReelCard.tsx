import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { CountdownRing } from './CountdownRing';
import { ProofMedia } from './ProofMedia';
import { StatusBanner } from './StatusBanner';
import { VoteBar } from './VoteBar';
import { VoteButtons } from './VoteButtons';
import { MoreIcon } from '@/components/icons';
import { Avatar } from '@/components/ui/Avatar';
import { Colors, F, S } from '@/constants/tokens';
import { useVote } from '@/hooks/useVote';
import type { Drift } from '@/types/drift';

type DriftReelCardProps = {
  drift: Drift;
  height: number;
};

export function DriftReelCard({ drift, height }: DriftReelCardProps) {
  const router = useRouter();
  const vote = useVote(drift);

  return (
    <View style={[styles.root, { height }]}>
      <Pressable
        style={styles.body}
        onPress={() => router.push({ pathname: '/(drift)/[id]', params: { id: drift.id } })}
      >
        <View style={styles.top}>
          <View style={styles.author}>
            <Avatar username={drift.authorUsername} avatarUrl={null} reputationScore={drift.authorReputationScore} size={38} />
            <View style={styles.authorText}>
              <Text style={styles.username}>@{drift.authorUsername}</Text>
              <Text style={styles.meta}>{drift.authorReputationScore} rep</Text>
            </View>
          </View>
          <CountdownRing expiresAt={drift.expiresAt} size={46} strokeWidth={3} />
        </View>

        <View style={styles.copy}>
          <Text style={styles.text}>{drift.text}</Text>
          {drift.context ? <Text style={styles.context}>{drift.context}</Text> : null}
          <Text style={styles.stake}>{drift.stake}</Text>
        </View>

        <ProofMedia url={drift.proofUrl} type={drift.proofType} />
        <StatusBanner drift={drift} />
      </Pressable>

      <View style={styles.actions}>
        <MoreIcon size={24} color={Colors.white} />
        <VoteBar votesYes={drift.votesYes} votesNo={drift.votesNo} />
        <VoteButtons currentVote={vote.currentVote} canVote={vote.canVote} loadingVote={vote.loadingVote} onVote={vote.vote} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    backgroundColor: Colors.black,
    justifyContent: 'flex-end',
  },
  body: {
    flex: 1,
    paddingHorizontal: S.lg,
    paddingTop: S.x5,
    paddingBottom: S.x2,
    justifyContent: 'space-between',
    gap: S.lg,
  },
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  author: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: S.md,
  },
  authorText: {
    gap: 2,
  },
  username: {
    color: Colors.white,
    fontFamily: F.family.bodySemi,
    fontSize: F.size.base,
  },
  meta: {
    color: Colors.textSecondary,
    fontFamily: F.family.bodyRegular,
    fontSize: F.size.sm,
  },
  copy: {
    gap: S.md,
  },
  text: {
    color: Colors.white,
    fontFamily: F.family.displayBlack,
    fontSize: 34,
    lineHeight: 38,
  },
  context: {
    color: Colors.textSecondary,
    fontFamily: F.family.bodyRegular,
    fontSize: F.size.base,
    lineHeight: F.size.base * F.lineHeight.normal,
  },
  stake: {
    color: Colors.volt,
    fontFamily: F.family.bodySemi,
    fontSize: F.size.base,
  },
  actions: {
    paddingHorizontal: S.lg,
    paddingBottom: S.lg,
    gap: S.md,
  },
});
