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

  const validateUsername = (value: string) => {
    const result = UsernameSchema.safeParse(value);
    if (!result.success) {
      return result.error.issues[0]?.message;
    }
    return null;
  };

  const validateBio = (value: string) => {
    const result = BioSchema.safeParse(value);
    if (!result.success) {
      return result.error.issues[0]?.message;
    }
    return null;
  };

  const save = async () => {
    if (!profile) {
      pushToast({
        title: 'Error',
        message: 'Profile not found',
        tone: 'danger',
      });
      return;
    }

    // Validate username
    const usernameError = validateUsername(username);
    if (usernameError) {
      pushToast({
        title: 'Invalid username',
        message: usernameError,
        tone: 'warning',
      });
      return;
    }

    // Validate bio
    const bioError = validateBio(bio);
    if (bioError) {
      pushToast({
        title: 'Invalid bio',
        message: bioError,
        tone: 'warning',
      });
      return;
    }

    setSaving(true);
    try {
      await updateUserProfile(profile.uid, {
        username: username.trim(),
        displayName: displayName.trim() || username.trim(),
        bio: bio.trim(),
      });

      // Update local profile data
      // The auth store should refresh automatically via the listener

      pushToast({
        title: 'Success',
        message: 'Profile updated successfully',
        tone: 'success',
      });

      router.back();
    } catch (error) {
      logger.error('Edit profile failed', { error: String(error) });
      pushToast({
        title: 'Save failed',
        message: firebaseErrorMessage(String(error)),
        tone: 'danger',
      });
    } finally {
      setSaving(false);
    }
  };

  const isFormValid = () => {
    return username.trim().length > 0 && bio.length <= 110;
  };

  return (
    <View style={styles.root}>
      <Header title="Edit Profile" showBack />
      <View style={styles.content}>
        <Input
          label="Username"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
          autoCorrect={false}
          placeholder="Enter username"
          maxLength={30}
        />

        <Input
          label="Display name (optional)"
          value={displayName}
          onChangeText={setDisplayName}
          placeholder="Your display name"
          maxLength={50}
        />

        <View style={styles.bioContainer}>
          <Input
            label="Bio"
            value={bio}
            onChangeText={setBio}
            maxLength={110}
            multiline
            style={styles.bio}
            placeholder="Tell us about yourself"
          />
          <Text style={styles.characterCount}>
            {bio.length}/110
          </Text>
        </View>

        <Button
          label="Save profile"
          onPress={save}
          loading={saving}
          disabled={!isFormValid() || saving}
        />
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
  bioContainer: {
    position: 'relative',
  },
  bio: {
    minHeight: 110,
    textAlignVertical: 'top',
    paddingBottom: 35, // Space for character counter
  },
  characterCount: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    color: Colors.textSecondary,
    fontSize: 12,
    fontFamily: 'monospace',
  },
});