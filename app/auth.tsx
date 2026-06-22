import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { AppHeader } from '@/components/layout/AppHeader';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { TextField } from '@/components/ui/TextField';
import { colors } from '@/constants/colors';
import { fontFamily } from '@/constants/typography';
import { useAuth } from '@/hooks/useAuth';

export default function AuthScreen() {
  const router = useRouter();
  const auth = useAuth();
  const [username, setUsername] = useState('');
  const [usernameError, setUsernameError] = useState<string | null>(null);

  useEffect(() => {
    if (auth.profile) {
      router.replace('/feed');
    }
  }, [auth.profile, router]);

  const submitUsername = async () => {
    setUsernameError(null);

    try {
      await auth.completeUsername(username);
      router.replace('/feed');
    } catch (error) {
      setUsernameError(error instanceof Error ? error.message : 'Could not save username.');
    }
  };

  return (
    <ScreenWrapper scroll keyboard>
      <AppHeader title="DRIFT" eyebrow="AUTH" />
      <View style={styles.wrap}>
        <Text style={styles.statement}>Choose an identity before the crowd starts steering.</Text>
        <Button
          label="Continue with Google"
          variant="secondary"
          fullWidth
          disabled={!auth.googleReady}
          loading={auth.googlePending}
          onPress={auth.signInGoogle}
        />
        <Button label="Enter as Ghost" variant="ghost" fullWidth loading={auth.loading} onPress={auth.signInGuest} />
        {auth.error ? <Text style={styles.error}>{auth.error}</Text> : null}
      </View>

      <Modal visible={auth.needsUsername} onClose={undefined}>
        <View style={styles.modalBody}>
          <Text style={styles.modalTitle}>Claim a username</Text>
          <Text style={styles.modalCopy}>3-20 letters, numbers, or underscores. This has to be unique.</Text>
          <TextField
            autoCapitalize="none"
            autoCorrect={false}
            value={username}
            onChangeText={setUsername}
            placeholder="drifter_01"
            error={usernameError ?? undefined}
          />
          <Button label="Save username" variant="primary" fullWidth loading={auth.loading} onPress={submitUsername} />
        </View>
      </Modal>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 14,
    paddingTop: 42,
  },
  statement: {
    color: colors.textPrimary,
    fontFamily: fontFamily.displayBold,
    fontSize: 34,
    lineHeight: 39,
    marginBottom: 12,
  },
  error: {
    color: colors.fire,
    fontFamily: fontFamily.bodyMedium,
    fontSize: 13,
  },
  modalBody: {
    gap: 14,
  },
  modalTitle: {
    color: colors.textPrimary,
    fontFamily: fontFamily.displayBold,
    fontSize: 26,
  },
  modalCopy: {
    color: colors.textMuted,
    fontFamily: fontFamily.body,
    fontSize: 14,
    lineHeight: 20,
  },
});
