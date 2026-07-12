import { useState } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { useRouter } from 'expo-router';

import { Header } from '@/components/navigation/Header';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Colors, S } from '@/constants/tokens';
import { updateUserProfile } from '@/lib/firebase/users';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';
import { firebaseErrorMessage } from '@/utils/formatters';
import { logger } from '@/utils/logger';
import { BioSchema, UsernameSchema } from '@/utils/validation';

export default function EditProfileScreen() {
  const router = useRouter();
  const profile = useAuthStore((state) => state.profile);
  const pushToast = useUIStore((state) => state.pushToast);
  const [username, setUsername] = useState(profile?.username ?? '');
  const [displayName, setDisplayName] = useState(profile?.displayName ?? '');
  const [bio, setBio] = useState(profile?.bio ?? '');
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!profile) return;
    const parsedUsername = UsernameSchema.safeParse(username);
    const parsedBio = BioSchema.safeParse(bio);
    if (!parsedUsername.success || !parsedBio.success) {
      pushToast({
        title: 'Profile invalid',
        message: parsedUsername.error?.issues[0]?.message ?? parsedBio.error?.issues[0]?.message,
        tone: 'warning',
      });
      return;
    }

    setSaving(true);
    try {
      await updateUserProfile(profile.uid, {
        username: parsedUsername.data,
        displayName,
        bio: parsedBio.data,
      });
      router.back();
    } catch (error) {
      logger.error('Edit profile failed', { error: String(error) });
      pushToast({ title: 'Save failed', message: firebaseErrorMessage(String(error)), tone: 'danger' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.root}>
      <Header title="Edit Profile" showBack />
      <View style={styles.content}>
        <Input label="Username" value={username} onChangeText={setUsername} autoCapitalize="none" />
        <Input label="Display name" value={displayName} onChangeText={setDisplayName} />
        {/* Bio input with character counter */}
        <Input
          label="Bio"
          value={bio}
          onChangeText={setBio}
          maxLength={110}
          multiline
          style={styles.bio}
        />
        <View style={{ alignItems: 'flex-end', marginBottom: 8 }}>
          <Text style={{ color: Colors.textSecondary, fontSize: 12 }}>
            {bio.length}/110
          </Text>
        </View>
        <Button label="Save profile" onPress={() => void save()} loading={saving} />
      </View>
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
    gap: S.lg,
  },
  bio: {
    minHeight: 110,
    textAlignVertical: 'top',
  },
});
