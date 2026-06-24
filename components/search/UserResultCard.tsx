import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Colors, F, R, S } from '@/constants/tokens';
import { useFollow } from '@/hooks/useFollow';
import { useAuthStore } from '@/stores/authStore';
import type { UserProfile } from '@/types/user';

type UserResultCardProps = {
  user: UserProfile;
};

export function UserResultCard({ user }: UserResultCardProps) {
  const router = useRouter();
  const currentUid = useAuthStore((state) => state.firebaseUser?.uid);
  const follow = useFollow(user.uid);
  const isSelf = currentUid === user.uid;

  return (
    <View style={styles.card}>
      <Pressable
        onPress={() => router.push({ pathname: '/(user)/[username]', params: { username: user.username } })}
        style={styles.top}
      >
        <Avatar username={user.username} avatarUrl={user.avatarUrl} reputationScore={user.reputationScore} size={52} />
        <View style={styles.copy}>
          <Text style={styles.username}>@{user.username}</Text>
          <Text style={styles.meta}>
            {user.followersCount} followers  |  {user.driftsCreated} posts
          </Text>
          <Text numberOfLines={2} style={styles.bio}>
            {user.bio ?? 'Open profile to view public commitments and recent activity.'}
          </Text>
        </View>
      </Pressable>
      <View style={styles.actions}>
        <Button
          label="View profile"
          variant="secondary"
          onPress={() => router.push({ pathname: '/(user)/[username]', params: { username: user.username } })}
        />
        <Button
          label={isSelf ? 'Your account' : follow.following ? 'Following' : 'Follow'}
          onPress={isSelf ? undefined : () => void follow.toggle()}
          variant={isSelf || follow.following ? 'secondary' : 'primary'}
          disabled={isSelf || !follow.canFollow}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: S.md,
    borderRadius: R.lg,
    borderWidth: S.px,
    borderColor: Colors.stroke,
    backgroundColor: Colors.bgSurface,
    padding: S.lg,
  },
  top: {
    flexDirection: 'row',
    gap: S.md,
    alignItems: 'center',
  },
  copy: {
    flex: 1,
    gap: S.xs,
  },
  username: {
    color: Colors.textPrimary,
    fontFamily: F.family.bodySemi,
    fontSize: F.size.base,
  },
  meta: {
    color: Colors.textSecondary,
    fontFamily: F.family.monoMedium,
    fontSize: F.size.xs,
  },
  bio: {
    color: Colors.textMuted,
    fontFamily: F.family.bodyRegular,
    fontSize: F.size.sm,
    lineHeight: F.size.sm * F.lineHeight.normal,
  },
  actions: {
    flexDirection: 'row',
    gap: S.md,
  },
});
