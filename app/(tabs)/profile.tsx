import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { ReputationRing } from '@/components/drift/ReputationRing';
import { GridIcon, PaperPlaneIcon, ReelsIcon, SettingsIcon } from '@/components/icons';
import { Header } from '@/components/navigation/Header';
import { Avatar } from '@/components/ui/Avatar';
import { EmptyState } from '@/components/ui/EmptyState';
import { IconButton } from '@/components/ui/IconButton';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Colors, F, R, S } from '@/constants/tokens';
import { ProfileCardShowcase } from '@/features/roulette/components/ProfileCardShowcase';
import { subscribeAuthorDrifts, subscribeVotedDrifts } from '@/lib/firebase/drifts';
import { useAuthStore } from '@/stores/authStore';
import type { Drift } from '@/types/drift';
import { reputationLabelUpper } from '@/utils/reputation';


type ProfileTab = 'created' | 'voted' | 'saved';

export default function ProfileScreen() {
  const router = useRouter();
  const profile = useAuthStore((state) => state.profile);
  const profileUid = profile?.uid;
  const [tab, setTab] = useState<ProfileTab>('created');
  const [created, setCreated] = useState<Drift[]>([]);
  const [voted, setVoted] = useState<Drift[]>([]);

  useEffect(() => {
    if (!profileUid) {
      setCreated([]);
      setVoted([]);
      return undefined;
    }

    if (tab === 'created') {
      return subscribeAuthorDrifts(profileUid, setCreated, () => undefined);
    }

    if (tab === 'voted') {
      return subscribeVotedDrifts(profileUid, setVoted, () => undefined);
    }

    return undefined;
  }, [profileUid, tab]);

  if (!profile) {
    return (
      <View style={styles.root}>
        <Header title="Profile" showBack />
        <EmptyState title="No profile" message="Sign in to build reputation." />
      </View>
    );
  }

  const list = tab === 'created' ? created : tab === 'voted' ? voted : [];

  return (
    <View style={styles.root}>
      <Header
        title="Profile"
        showBack
        right={
          <View style={styles.headerActions}>
            <IconButton icon={PaperPlaneIcon} label="Messages" onPress={() => router.push('/(chat)')} />
            <IconButton icon={SettingsIcon} label="Settings" onPress={() => router.push('/(modals)/settings')} />
          </View>
        }
      />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.hero}>
          <Avatar username={profile.username} avatarUrl={profile.avatarUrl} reputationScore={profile.reputationScore} size={86} />
          <View style={styles.stats}>
            <View style={styles.statBlock}>
              <Text style={styles.statNumber}>{profile.driftsCreated}</Text>
              <Text style={styles.statLabel}>posts</Text>
            </View>
            <View style={styles.statBlock}>
              <Text style={styles.statNumber}>{profile.followersCount}</Text>
              <Text style={styles.statLabel}>followers</Text>
            </View>
            <View style={styles.statBlock}>
              <Text style={styles.statNumber}>{profile.followingCount}</Text>
              <Text style={styles.statLabel}>following</Text>
            </View>
          </View>
        </View>
        <View style={styles.identity}>
          <Text style={styles.username}>@{profile.username}</Text>
          <Text style={styles.bio}>{profile.bio ?? 'No bio yet.'}</Text>
          <Text style={styles.repLine}>
            {profile.reputationScore} rep · {reputationLabelUpper(profile.reputationScore)} · streak {profile.streakCurrent}
          </Text>
        </View>
        <View style={styles.editRow}>
          <Pressable onPress={() => router.push('/(modals)/edit-profile')} style={styles.edit}>
            <Text style={styles.editText}>Edit profile</Text>
          </Pressable>
          <View style={styles.repMini}>
            <ReputationRing score={profile.reputationScore} size={28} strokeWidth={3} />
            <ProgressBar progress={Math.min(1, profile.streakCurrent / 7)} tone="amber" />
          </View>
        </View>
        <ProfileCardShowcase />
        <View style={styles.tabs}>
          {(['created', 'voted', 'saved'] as ProfileTab[]).map((item, index) => (
            <Pressable key={item} onPress={() => setTab(item)} style={[styles.tab, tab === item ? styles.activeTab : null]}>
              {index === 0 ? (
                <GridIcon size={22} color={tab === item ? Colors.white : Colors.textTertiary} />
              ) : index === 1 ? (
                <ReelsIcon size={22} color={tab === item ? Colors.white : Colors.textTertiary} />
              ) : (
                <Text style={[styles.tabText, tab === item ? styles.activeTabText : null]}>Saved</Text>
              )}
            </Pressable>
          ))}
        </View>
        <View style={styles.grid}>
          {list.map((drift) => (
            <Pressable
              key={drift.id}
              onPress={() => router.push({ pathname: '/(drift)/[id]', params: { id: drift.id } })}
              style={styles.tile}
            >
              <Text numberOfLines={5} style={styles.tileText}>{drift.text}</Text>
              <Text style={styles.tileMeta}>{drift.votesYes + drift.votesNo}</Text>
            </Pressable>
          ))}
        </View>
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
    paddingBottom: S.x7,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: S.xs,
  },
  hero: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: S.lg,
    paddingTop: S.lg,
    gap: S.x3,
  },
  identity: {
    paddingHorizontal: S.lg,
    paddingTop: S.md,
    gap: S.xs,
  },
  username: {
    color: Colors.textPrimary,
    fontFamily: F.family.bodySemi,
    fontSize: F.size.base,
  },
  bio: {
    color: Colors.white,
    fontFamily: F.family.bodyRegular,
    fontSize: F.size.base,
  },
  repLine: {
    color: Colors.textSecondary,
    fontFamily: F.family.bodyRegular,
    fontSize: F.size.sm,
  },
  editRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: S.md,
    paddingHorizontal: S.lg,
    paddingTop: S.md,
    paddingBottom: S.lg,
  },
  edit: {
    flex: 1,
    alignItems: 'center',
    borderRadius: R.sm,
    borderWidth: S.px,
    borderColor: Colors.strokeStrong,
    backgroundColor: Colors.surfaceRaised,
    paddingVertical: S.sm,
  },
  editText: {
    color: Colors.white,
    fontFamily: F.family.bodySemi,
    fontSize: F.size.sm,
  },
  repMini: {
    width: 120,
    flexDirection: 'row',
    alignItems: 'center',
    gap: S.sm,
  },
  stats: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statBlock: {
    alignItems: 'center',
    gap: 2,
  },
  statNumber: {
    color: Colors.white,
    fontFamily: F.family.bodySemi,
    fontSize: F.size.lg,
  },
  statLabel: {
    color: Colors.white,
    fontFamily: F.family.bodyRegular,
    fontSize: F.size.sm,
  },
  tabs: {
    flexDirection: 'row',
    borderTopWidth: S.px,
    borderBottomWidth: S.px,
    borderColor: Colors.separator,
  },
  tab: {
    flex: 1,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: S.px,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: Colors.white,
  },
  tabText: {
    color: Colors.textSecondary,
    fontFamily: F.family.bodySemi,
    fontSize: F.size.sm,
  },
  activeTabText: {
    color: Colors.white,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tile: {
    width: '33.3333%',
    aspectRatio: 1,
    borderRightWidth: S.px,
    borderBottomWidth: S.px,
    borderColor: Colors.black,
    backgroundColor: Colors.surface,
    padding: S.sm,
    justifyContent: 'space-between',
  },
  tileText: {
    color: Colors.white,
    fontFamily: F.family.bodySemi,
    fontSize: F.size.sm,
    lineHeight: F.size.sm * F.lineHeight.normal,
  },
  tileMeta: {
    color: Colors.volt,
    fontFamily: F.family.bodySemi,
    fontSize: F.size.xs,
  },
});
