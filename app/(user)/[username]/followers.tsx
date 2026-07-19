import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { Header } from '@/components/navigation/Header';
import { Avatar } from '@/components/ui/Avatar';
import { EmptyState } from '@/components/ui/EmptyState';
import { Spinner } from '@/components/ui/Spinner';
import { Colors, F, R, S } from '@/constants/tokens';
import { subscribeFollowers, subscribeFollowing } from '@/lib/firebase/follows';
import { getUserByUsername } from '@/lib/firebase/users';
import type { UserProfile } from '@/types/user';

export default function FollowersScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ username?: string; mode?: string }>();
  const username = typeof params.username === 'string' ? params.username : undefined;
  const mode = params.mode === 'following' ? 'following' : 'followers';
  const [followers, setFollowers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribe: (() => void) | null = null;
    let mounted = true;
    if (!username) {
      setLoading(false);
      return;
    }

    getUserByUsername(username).then((profile) => {
      if (!mounted || !profile) {
        setLoading(false);
        return;
      }

      unsubscribe = (mode === 'following' ? subscribeFollowing : subscribeFollowers)(
        profile.uid,
        (items) => {
          setFollowers(items);
          setLoading(false);
        },
        () => setLoading(false),
      );
    });

    return () => {
      mounted = false;
      unsubscribe?.();
    };
  }, [mode, username]);

  return (
    <View style={styles.root}>
      <Header title={mode === 'following' ? 'Following' : 'Followers'} showBack />
      {loading ? (
        <Spinner label="Loading followers" />
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          {followers.map((profile) => (
            <Pressable
              key={profile.uid}
              onPress={() => router.push({ pathname: '/(user)/[username]', params: { username: profile.username } })}
              style={styles.row}
            >
              <Avatar username={profile.username} avatarUrl={profile.avatarUrl} reputationScore={profile.reputationScore} size={40} />
              <View style={styles.textWrap}>
                <Text style={styles.username}>@{profile.username}</Text>
                <Text style={styles.meta}>{profile.reputationScore} reputation</Text>
              </View>
            </Pressable>
          ))}
          {followers.length === 0 ? <EmptyState title={mode === 'following' ? 'Not following anyone' : 'No followers'} message="Profiles will appear here." /> : null}
        </ScrollView>
      )}
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
    gap: S.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: S.md,
    borderRadius: R.md,
    borderWidth: S.px,
    borderColor: Colors.stroke,
    backgroundColor: Colors.bgSurface,
    padding: S.md,
  },
  textWrap: {
    flex: 1,
    gap: S.xs,
  },
  username: {
    color: Colors.textPrimary,
    fontFamily: F.family.bodySemi,
    fontSize: F.size.base,
  },
  meta: {
    color: Colors.textMuted,
    fontFamily: F.family.monoMedium,
    fontSize: F.size.xs,
  },
});
