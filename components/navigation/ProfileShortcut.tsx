import { Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

import { Avatar } from '@/components/ui/Avatar';
import { R } from '@/constants/tokens';
import { useAuthStore } from '@/stores/authStore';

export function ProfileShortcut() {
  const router = useRouter();
  const profile = useAuthStore((state) => state.profile);

  if (!profile) {
    return null;
  }

  return (
    <Pressable
      accessibilityLabel="Open profile"
      accessibilityRole="button"
      onPress={() => router.push('/profile')}
      style={({ pressed }) => [styles.button, pressed ? styles.pressed : null]}
    >
      <Avatar
        username={profile.username}
        avatarUrl={profile.avatarUrl}
        reputationScore={profile.reputationScore}
        size={28}
        showReputationRing={false}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 32,
    height: 32,
    borderRadius: R.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.75,
  },
});
