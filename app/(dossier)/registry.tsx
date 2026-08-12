import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { FlashList } from '@shopify/flash-list';

import { CasePanel } from '@/components/dossier/CasePanel';
import { DossierSkeleton } from '@/components/dossier/DossierSkeleton';
import { Avatar } from '@/components/ui/Avatar';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { Header } from '@/components/navigation/Header';
import { Colors, F, R, S } from '@/constants/tokens';
import { subscribeFulfillmentRegistry } from '@/lib/firebase/users';
import type { UserProfile } from '@/types/user';

type RankMode = 'fulfilled' | 'jury';

function performance(profile: UserProfile): number {
  const resolved = profile.driftsExecuted + profile.driftsFailed;
  return resolved > 0 ? Math.round((profile.driftsExecuted / resolved) * 100) : 0;
}

export default function RegistryScreen() {
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [mode, setMode] = useState<RankMode>('fulfilled');

  useEffect(() => {
    setLoading(true);
    setFailed(false);
    return subscribeFulfillmentRegistry((items) => {
      setProfiles(items);
      setLoading(false);
    }, () => {
      setLoading(false);
      setFailed(true);
    });
  }, [attempt]);

  const ranking = useMemo(
    () => [...profiles].sort((left, right) => mode === 'fulfilled'
      ? right.driftsExecuted - left.driftsExecuted || right.reputationScore - left.reputationScore
      : right.driftsVotedOn - left.driftsVotedOn || right.reputationScore - left.reputationScore),
    [mode, profiles],
  );

  return (
    <View style={styles.root}>
      <Header title="THE REGISTRY" showBack />
      {loading ? <DossierSkeleton rows={5} /> : failed ? <ErrorState title="Registry sealed" message="Ranks could not be checked." onRetry={() => setAttempt((value) => value + 1)} /> : (
        <FlashList
          data={ranking}
          keyExtractor={(item) => item.uid}
          drawDistance={600}
          overrideProps={{ initialDrawBatchSize: 10 }}
          contentContainerStyle={styles.content}
          ListHeaderComponent={
            <>
              <CasePanel>
                <Text style={styles.kicker}>WEEKLY STANDING</Text>
                <Text style={styles.title}>WHO CARRIED THEIR CASE?</Text>
                <Text style={styles.description}>Ranked from existing public fulfillment and jury records.</Text>
              </CasePanel>
              <View style={styles.tabs}>
                <Pressable onPress={() => setMode('fulfilled')} style={[styles.tab, mode === 'fulfilled' ? styles.tabActive : null]}><Text style={[styles.tabText, mode === 'fulfilled' ? styles.tabTextActive : null]}>FULFILLERS</Text></Pressable>
                <Pressable onPress={() => setMode('jury')} style={[styles.tab, mode === 'jury' ? styles.tabActive : null]}><Text style={[styles.tabText, mode === 'jury' ? styles.tabTextActive : null]}>JURY SERVICE</Text></Pressable>
              </View>
            </>
          }
          ListEmptyComponent={<EmptyState title="No ranked cases" message="The registry will populate when public records arrive." />}
          renderItem={({ item, index }) => (
            <CasePanel style={styles.row}>
              <Text style={styles.rank}>{String(index + 1).padStart(2, '0')}</Text>
              <Avatar username={item.username} avatarUrl={item.avatarUrl} reputationScore={item.reputationScore} size={36} />
              <View style={styles.person}>
                <Text style={styles.name}>@{item.username}</Text>
                <Text style={styles.meta}>{mode === 'fulfilled' ? `${performance(item)}% fulfillment rate` : `${item.driftsVotedOn} ballots logged`}</Text>
              </View>
              <View style={styles.score}><Text style={styles.scoreValue}>{mode === 'fulfilled' ? item.driftsExecuted : item.driftsVotedOn}</Text><Text style={styles.scoreLabel}>{mode === 'fulfilled' ? 'CASES' : 'VOTES'}</Text></View>
            </CasePanel>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.wall },
  content: { gap: S.sm, padding: S.lg, paddingBottom: S.x7 },
  kicker: { color: Colors.slate, fontFamily: F.family.monoBold, fontSize: F.size.xs, letterSpacing: 0.5 },
  title: { color: Colors.ink, fontFamily: F.family.displayBold, fontSize: F.size.xl, marginTop: S.sm },
  description: { color: Colors.slate, fontFamily: F.family.bodyRegular, fontSize: F.size.sm, marginTop: S.xs },
  tabs: { flexDirection: 'row', gap: S.sm, marginVertical: S.sm },
  tab: { flex: 1, borderWidth: S.px, borderColor: Colors.slate, borderRadius: R.sm, paddingVertical: S.sm, alignItems: 'center' },
  tabActive: { borderColor: Colors.ledger, backgroundColor: Colors.ledger },
  tabText: { color: Colors.dossier, fontFamily: F.family.monoBold, fontSize: F.size.xs },
  tabTextActive: { color: Colors.dossier },
  row: { flexDirection: 'row', alignItems: 'center', gap: S.sm, padding: S.md },
  rank: { width: S.x2, color: Colors.slate, fontFamily: F.family.monoBold, fontSize: F.size.sm },
  person: { flex: 1, gap: 1 },
  name: { color: Colors.ink, fontFamily: F.family.bodySemi, fontSize: F.size.base },
  meta: { color: Colors.slate, fontFamily: F.family.bodyRegular, fontSize: F.size.xs },
  score: { alignItems: 'flex-end' },
  scoreValue: { color: Colors.ink, fontFamily: F.family.monoBold, fontSize: F.size.md },
  scoreLabel: { color: Colors.slate, fontFamily: F.family.monoBold, fontSize: F.size.micro },
});
