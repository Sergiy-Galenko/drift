import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { DriftCardCompact } from '@/components/drift/DriftCardCompact';
import { ReputationRing } from '@/components/drift/ReputationRing';
import { SettingsIcon } from '@/components/icons';
import { Header } from '@/components/navigation/Header';
import { Avatar } from '@/components/ui/Avatar';
import { EmptyState } from '@/components/ui/EmptyState';
import { IconButton } from '@/components/ui/IconButton';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Colors, F, R, S } from '@/constants/tokens';
import { subscribeAuthorDrifts, subscribeVotedDrifts } from '@/lib/firebase/drifts';
import { useAuthStore } from '@/stores/authStore';
import type { Drift } from '@/types/drift';
import { reputationLabelUpper } from '@/utils/reputation';

type ProfileTab = 'created' | 'voted' | 'saved';

export default function ProfileScreen() {
  const router = useRouter();
  const profile = useAuthStore((state) => state.profile);
  const [tab, setTab] = useState<ProfileTab>('created');
  const [created, setCreated] = useState<Drift[]>([]);
  const [voted, setVoted] = useState<Drift[]>([]);

  useEffect(() => {
    if (!profile) return;
    const unsubscribeCreated = subscribeAuthorDrifts(profile.uid, setCreated, () => undefined);
    const unsubscribeVoted = subscribeVotedDrifts(profile.uid, setVoted, () => undefined);
    return () => {
      unsubscribeCreated();
      unsubscribeVoted();
    };
  }, [profile]);

  if (!profile) {
    return (
      <View style={styles.root}>
        <Header title="Profile" />
        <EmptyState title="No profile" message="Sign in to build reputation." />
      </View>
    );
  }

  const list = tab === 'created' ? created : tab === 'voted' ? voted : [];

  return (
    <View style={styles.root}>
      <Header
        title="Profile"
        right={<IconButton icon={SettingsIcon} label="Settings" onPress={() => router.push('/(modals)/settings')} />}
      />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.hero}>
          <Avatar username={profile.username} avatarUrl={profile.avatarUrl} reputationScore={profile.reputationScore} size={72} />
          <View style={styles.identity}>
            <Text style={styles.username}>@{profile.username}</Text>
            <Text style={styles.bio}>{profile.bio ?? 'No bio yet.'}</Text>
            <Pressable onPress={() => router.push('/(modals)/edit-profile')} style={styles.edit}>
              <Text style={styles.editText}>EDIT PROFILE</Text>
            </Pressable>
          </View>
        </View>
        <View style={styles.repCard}>
          <ReputationRing score={profile.reputationScore} size={86} strokeWidth={5} />
          <View style={styles.repText}>
            <Text style={styles.score}>{profile.reputationScore}</Text>
            <Text style={styles.tier}>{reputationLabelUpper(profile.reputationScore)}</Text>
          </View>
          <View style={styles.streak}>
            <Text style={styles.meta}>STREAK {profile.streakCurrent}</Text>
            <ProgressBar progress={Math.min(1, profile.streakCurrent / 7)} tone="amber" />
          </View>
        </View>
        <View style={styles.stats}>
          <Text style={styles.stat}>{profile.driftsCreated} CREATED</Text>
          <Text style={styles.stat}>{profile.driftsExecuted} EXECUTED</Text>
          <Text style={styles.stat}>{profile.followersCount} FOLLOWERS</Text>
        </View>
        <View style={styles.tabs}>
          {(['created', 'voted', 'saved'] as ProfileTab[]).map((item) => (
            <Pressable key={item} onPress={() => setTab(item)} style={[styles.tab, tab === item ? styles.activeTab : null]}>
              <Text style={[styles.tabText, tab === item ? styles.activeTabText : null]}>{item.toUpperCase()}</Text>
            </Pressable>
          ))}
        </View>
        {list.map((drift) => (
          <DriftCardCompact key={drift.id} drift={drift} />
        ))}
        {list.length === 0 ? <EmptyState title="Empty tab" message="Your history will appear here as you use DRIFT." /> : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.bgBase,
  },
  content: {
    padding: S.lg,
    gap: S.x2,
  },
  hero: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: S.x2,
  },
  identity: {
    flex: 1,
    gap: S.sm,
  },
  username: {
    color: Colors.textPrimary,
    fontFamily: F.family.displayBold,
    fontSize: F.size.xl,
  },
  bio: {
    color: Colors.textSecondary,
    fontFamily: F.family.bodyRegular,
    fontSize: F.size.base,
  },
  edit: {
    alignSelf: 'flex-start',
    borderRadius: R.pill,
    borderWidth: S.px,
    borderColor: Colors.strokeStrong,
    paddingHorizontal: S.md,
    paddingVertical: S.xs,
  },
  editText: {
    color: Colors.accentVolt,
    fontFamily: F.family.monoBold,
    fontSize: F.size.xs,
  },
  repCard: {
    borderRadius: R.lg,
    borderWidth: S.px,
    borderColor: Colors.strokeStrong,
    backgroundColor: Colors.bgSurface,
    padding: S.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: S.lg,
  },
  repText: {
    alignItems: 'center',
  },
  score: {
    color: Colors.textPrimary,
    fontFamily: F.family.displayBlack,
    fontSize: F.size.x2,
  },
  tier: {
    color: Colors.accentVolt,
    fontFamily: F.family.monoBold,
    fontSize: F.size.xs,
  },
  streak: {
    flex: 1,
    gap: S.sm,
  },
  meta: {
    color: Colors.textMuted,
    fontFamily: F.family.monoBold,
    fontSize: F.size.xs,
  },
  stats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: S.md,
  },
  stat: {
    color: Colors.textSecondary,
    fontFamily: F.family.monoBold,
    fontSize: F.size.xs,
    borderRadius: R.md,
    borderWidth: S.px,
    borderColor: Colors.stroke,
    padding: S.md,
  },
  tabs: {
    flexDirection: 'row',
    borderRadius: R.md,
    borderWidth: S.px,
    borderColor: Colors.strokeStrong,
    overflow: 'hidden',
  },
  tab: {
    flex: 1,
    padding: S.md,
    alignItems: 'center',
    backgroundColor: Colors.bgSurface,
  },
  activeTab: {
    backgroundColor: Colors.accentVolt,
  },
  tabText: {
    color: Colors.textSecondary,
    fontFamily: F.family.monoBold,
    fontSize: F.size.xs,
  },
  activeTabText: {
    color: Colors.bgBase,
  },
});
