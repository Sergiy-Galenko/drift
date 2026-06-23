import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { deleteUser } from 'firebase/auth';

import { Header } from '@/components/navigation/Header';
import { Button } from '@/components/ui/Button';
import { Switch } from '@/components/ui/Switch';
import { Colors, F, R, S } from '@/constants/tokens';
import { auth } from '@/lib/firebase/config';
import { updateUserSettings } from '@/lib/firebase/users';
import { useAuth } from '@/hooks/useAuth';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';
import { firebaseErrorMessage } from '@/utils/formatters';
import { logger } from '@/utils/logger';

export default function SettingsScreen() {
  const { signOut } = useAuth();
  const profile = useAuthStore((state) => state.profile);
  const pushToast = useUIStore((state) => state.pushToast);
  const [saving, setSaving] = useState(false);

  const update = async (key: keyof NonNullable<typeof profile>['settings'], value: boolean) => {
    if (!profile) return;
    setSaving(true);
    try {
      await updateUserSettings(profile.uid, { [key]: value });
    } catch (error) {
      logger.error('Settings update failed', { error: String(error) });
      pushToast({ title: 'Settings failed', message: firebaseErrorMessage(String(error)), tone: 'danger' });
    } finally {
      setSaving(false);
    }
  };

  const deleteAccount = () => {
    Alert.alert('Delete account?', 'This removes your Firebase auth account. Existing public drifts remain for integrity.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          if (auth.currentUser) {
            deleteUser(auth.currentUser).catch((error: unknown) => {
              logger.error('Delete account failed', { error: String(error) });
              pushToast({ title: 'Delete failed', message: firebaseErrorMessage(String(error)), tone: 'danger' });
            });
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.root}>
      <Header title="Settings" showBack />
      <ScrollView contentContainerStyle={styles.content}>
        {profile ? (
          <>
            <View style={styles.row}>
              <Text style={styles.label}>Notifications</Text>
              <Switch label="Notifications" value={profile.settings.notificationsEnabled} onValueChange={(value) => void update('notificationsEnabled', value)} />
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Anonymous by default</Text>
              <Switch label="Anonymous default" value={profile.settings.anonymousDefault} onValueChange={(value) => void update('anonymousDefault', value)} />
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Vibration</Text>
              <Switch label="Vibration" value={profile.settings.vibrationEnabled} onValueChange={(value) => void update('vibrationEnabled', value)} />
            </View>
          </>
        ) : null}
        <Button label="Sign out" variant="secondary" onPress={() => void signOut()} loading={saving} />
        <Button label="Delete account" variant="danger" onPress={deleteAccount} />
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
    gap: S.lg,
  },
  row: {
    borderRadius: R.md,
    borderWidth: S.px,
    borderColor: Colors.stroke,
    backgroundColor: Colors.bgSurface,
    padding: S.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    color: Colors.textPrimary,
    fontFamily: F.family.bodySemi,
    fontSize: F.size.base,
  },
});
