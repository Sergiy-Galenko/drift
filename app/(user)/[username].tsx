import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { DriftCardCompact } from '@/components/drift/DriftCardCompact';
import { Header } from '@/components/navigation/Header';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Spinner } from '@/components/ui/Spinner';
import { Colors, F, S } from '@/constants/tokens';
import { useFollow } from '@/hooks/useFollow';
import { useUserProfile } from '@/hooks/useUserProfile';
import { subscribeAuthorDrifts } from '@/lib/firebase/drifts';
import { useAuthStore } from '@/stores/authStore';
import type { Drift } from '@/types/drift';
import { reputationLabelUpper } from '@/utils/reputation';

export default function PublicProfileScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ username?: string }>();
  const username = typeof params.username === 'string' ? params.username : undefined;
  const { profile, loading } = useUserProfile(username, 'username');
  const follow = useFollow(profile?.uid);
  const currentUid = useAuthStore((state) => state.firebaseUser?.uid);
  const [drifts, setDrifts] = useState<Drift[]>([]);

  useEffect(() => {
    if (!profile) return;
    return subscribeAuthorDrifts(profile.uid, setDrifts, () => undefined);
  }, [profile]);

  if (loading) {
    return (
      <View style={styles.root}>
        <Header title="User" showBack />
        <Spinner label="Loading user" />
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={styles.root}>
        <Header title="User" showBack />
        <EmptyState title="User not found" message="That profile does not exist." />
      </View>
    );
  }

  const canMessage = Boolean(currentUid && profile.uid !== currentUid);

  return (
    <View style={styles.root}>
      <Header title={`@${profile.username}`} showBack />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.hero}>
          <Avatar username={profile.username} avatarUrl={profile.avatarUrl} reputationScore={profile.reputationScore} size={72} />
          <View style={styles.identity}>
            <Text style={styles.username}>@{profile.username}</Text>
            <Text style={styles.tier}>{profile.reputationScore} REP | {reputationLabelUpper(profile.reputationScore)}</Text>
            <Text style={styles.bio}>{profile.bio ?? 'No bio yet.'}</Text>
          </View>
        </View>
        <View style={styles.actions}>
          <Button label={follow.following ? 'Following' : 'Follow'} onPress={() => void follow.toggle()} disabled={!follow.canFollow} />
          {canMessage ? (
            <Button
              label="Message"
              variant="secondary"
              onPress={() =>
                router.push({
                  pathname: '/(chat)/new',
                  params: { uid: profile.uid, username: profile.username },
                })
              }
            />
          ) : null}
          <Button label={`${profile.followersCount} followers`} variant="secondary" onPress={() => router.push({ pathname: '/(user)/[username]/followers', params: { username: profile.username } })} />
        </View>
        <Text style={styles.sectionTitle}>Posts</Text>
        {drifts.map((drift) => (
          <DriftCardCompact key={drift.id} drift={drift} />
        ))}
        {drifts.length === 0 ? <EmptyState title="No public drifts" message="This user has not posted a visible commitment yet." /> : null}
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
    gap: S.x2,
    alignItems: 'center',
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
  tier: {
    color: Colors.accentVolt,
    fontFamily: F.family.monoBold,
    fontSize: F.size.xs,
  },
  bio: {
    color: Colors.textSecondary,
    fontFamily: F.family.bodyRegular,
    fontSize: F.size.base,
  },
  actions: {
    flexDirection: 'row',
    gap: S.md,
    flexWrap: 'wrap',
  },
  sectionTitle: {
    color: Colors.textPrimary,
    fontFamily: F.family.bodySemi,
    fontSize: F.size.base,
  },
});
