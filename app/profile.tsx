import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { DriftCard } from '@/components/drift/DriftCard';
import { ReputationRing } from '@/components/drift/ReputationRing';
import { AppHeader } from '@/components/layout/AppHeader';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { colors } from '@/constants/colors';
import { fontFamily, radius } from '@/constants/typography';
import { useAuth } from '@/hooks/useAuth';
import { useProfileHistory } from '@/hooks/useProfileHistory';
import type { Drift } from '@/types/drift';

type ProfileTab = 'created' | 'voted';

export default function ProfileScreen() {
  const router = useRouter();
  const auth = useAuth();
  const history = useProfileHistory(auth.profile?.uid);
  const [tab, setTab] = useState<ProfileTab>('created');

  useEffect(() => {
    if (auth.initialized && !auth.profile) {
      router.replace('/auth');
    }
  }, [auth.initialized, auth.profile, router]);

  if (!auth.profile) {
    return (
      <ScreenWrapper showTabs>
        <Spinner />
      </ScreenWrapper>
    );
  }

  const profile = auth.profile;
  const drifts = tab === 'created' ? history.created : history.voted;

  return (
    <ScreenWrapper showTabs scroll>
      <AppHeader title="Profile" eyebrow="COMMITMENT LEDGER" />

      <View style={styles.identity}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{profile.username.charAt(0).toUpperCase()}</Text>
        </View>
        <View style={styles.identityCopy}>
          <Text style={styles.username}>@{profile.username}</Text>
          <Text style={styles.muted}>Joined the drift with {profile.reputationScore} reputation.</Text>
        </View>
      </View>

      <View style={styles.reputationRow}>
        <ReputationRing score={profile.reputationScore} />
        <StatsGrid
          created={profile.driftsCreated}
          executed={profile.driftsExecuted}
          voted={profile.driftsVotedOn}
          score={profile.reputationScore}
        />
      </View>

      <View style={styles.streak}>
        <Text style={styles.streakText}>🔥 Current: {profile.streakCurrent} days   Best: {profile.streakBest} days</Text>
      </View>

      <View style={styles.tabs}>
        <TabButton label="Created" active={tab === 'created'} onPress={() => setTab('created')} />
        <TabButton label="Voted" active={tab === 'voted'} onPress={() => setTab('voted')} />
      </View>

      {history.loading ? <Spinner /> : null}
      {history.error ? <Text style={styles.error}>{history.error}</Text> : null}
      {!history.loading && drifts.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>{tab === 'created' ? "You haven't launched a drift." : "You haven't voted yet."}</Text>
          <Button label={tab === 'created' ? 'Start one' : 'Open feed'} variant="primary" onPress={() => router.push(tab === 'created' ? '/create' : '/feed')} />
        </View>
      ) : null}

      <View style={styles.history}>
        {drifts.map((drift) => (
          <HistoryItem key={drift.id} drift={drift} uid={profile.uid} tab={tab} />
        ))}
      </View>

      <Button label="Sign out" variant="ghost" fullWidth onPress={auth.signOut} />
    </ScreenWrapper>
  );
}

function StatsGrid({ created, executed, voted, score }: { created: number; executed: number; voted: number; score: number }) {
  return (
    <View style={styles.statsGrid}>
      <Stat label="Created" value={created} />
      <Stat label="Executed" value={executed} />
      <Stat label="Voted" value={voted} />
      <Stat label="Score" value={score} />
    </View>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

function TabButton({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.tab, active ? styles.tabActive : null]}>
      <Text style={[styles.tabText, active ? styles.tabTextActive : null]}>{label}</Text>
    </Pressable>
  );
}

function HistoryItem({ drift, uid, tab }: { drift: Drift; uid: string; tab: ProfileTab }) {
  const userVote = drift.voters[uid];

  return (
    <View style={styles.historyItem}>
      <View style={styles.historyMeta}>
        <Badge label={drift.status.toUpperCase()} tone={drift.status === 'executed' ? 'volt' : drift.status === 'failed' ? 'fire' : 'neutral'} />
        {tab === 'voted' && userVote ? <Badge label={`YOU VOTED ${userVote.toUpperCase()}`} tone={userVote === 'yes' ? 'volt' : 'fire'} /> : null}
      </View>
      <DriftCard drift={drift} compact />
    </View>
  );
}

const styles = StyleSheet.create({
  identity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  avatar: {
    width: 62,
    height: 62,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.stroke,
    backgroundColor: colors.elevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: colors.volt,
    fontFamily: fontFamily.displayBold,
    fontSize: 28,
  },
  identityCopy: {
    flex: 1,
    gap: 4,
  },
  username: {
    color: colors.textPrimary,
    fontFamily: fontFamily.displayBold,
    fontSize: 26,
  },
  muted: {
    color: colors.textMuted,
    fontFamily: fontFamily.body,
    fontSize: 13,
    lineHeight: 18,
  },
  reputationRow: {
    flexDirection: 'row',
    gap: 18,
    alignItems: 'center',
    marginTop: 22,
  },
  statsGrid: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    borderWidth: 1,
    borderColor: colors.stroke,
    borderRadius: radius.md,
    overflow: 'hidden',
  },
  stat: {
    width: '50%',
    minHeight: 56,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.stroke,
    padding: 9,
    gap: 3,
  },
  statLabel: {
    color: colors.textMuted,
    fontFamily: fontFamily.bodyMedium,
    fontSize: 11,
  },
  statValue: {
    color: colors.textPrimary,
    fontFamily: fontFamily.monoBold,
    fontSize: 18,
  },
  streak: {
    marginTop: 18,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.stroke,
    backgroundColor: colors.surface,
    padding: 14,
  },
  streakText: {
    color: colors.textPrimary,
    fontFamily: fontFamily.bodySemiBold,
    fontSize: 14,
  },
  tabs: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 20,
  },
  tab: {
    flex: 1,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.stroke,
    backgroundColor: colors.surface,
    paddingVertical: 12,
    alignItems: 'center',
  },
  tabActive: {
    borderColor: colors.volt,
  },
  tabText: {
    color: colors.textMuted,
    fontFamily: fontFamily.monoBold,
    fontSize: 12,
  },
  tabTextActive: {
    color: colors.volt,
  },
  empty: {
    gap: 12,
    paddingVertical: 28,
  },
  emptyTitle: {
    color: colors.textPrimary,
    fontFamily: fontFamily.displayBold,
    fontSize: 22,
  },
  history: {
    gap: 14,
    marginTop: 16,
    marginBottom: 18,
  },
  historyItem: {
    gap: 8,
  },
  historyMeta: {
    flexDirection: 'row',
    gap: 8,
  },
  error: {
    color: colors.fire,
    fontFamily: fontFamily.bodyMedium,
    fontSize: 13,
  },
});
