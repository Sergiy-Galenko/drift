import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { LocalizedText as Text } from '@/components/ui/LocalizedText';
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
import { localeOptions, type AppLocale } from '@/lib/i18n';
import { useLocaleStore } from '@/stores/localeStore';
import { firebaseErrorMessage } from '@/utils/formatters';
import { logger } from '@/utils/logger';
import { useTranslation } from '@/hooks/useTranslation';

export default function SettingsScreen() {
  const { signOut } = useAuth();
  const profile = useAuthStore((state) => state.profile);
  const pushToast = useUIStore((state) => state.pushToast);
  const locale = useLocaleStore((state) => state.locale);
  const setLocale = useLocaleStore((state) => state.setLocale);
  const { t } = useTranslation();
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
    Alert.alert(t('Delete account?'), t('This removes your Firebase auth account. Existing public drifts remain for integrity.'), [
      { text: t('Cancel'), style: 'cancel' },
      {
        text: t('Delete'),
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

  const selectLocale = (nextLocale: AppLocale) => setLocale(nextLocale);

  return (
    <View style={styles.root}>
      <Header title="Settings" showBack />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.languageCard}>
          <Text style={styles.label}>{t('Language')}</Text>
          <View style={styles.languageOptions}>
            {localeOptions.map((option) => (
              <Pressable
                key={option.code}
                accessibilityRole="button"
                accessibilityState={{ selected: locale === option.code }}
                accessibilityLabel={option.label}
                onPress={() => selectLocale(option.code)}
                style={[styles.languageOption, locale === option.code ? styles.languageOptionActive : null]}
              >
                <Text style={[styles.languageText, locale === option.code ? styles.languageTextActive : null]}>{option.label}</Text>
              </Pressable>
            ))}
          </View>
        </View>
        {profile ? (
          <>
            <View style={styles.row}>
              <Text style={styles.label} translate>Push notifications</Text>
              <Switch label="Push notifications" value={profile.settings.notificationsEnabled} onValueChange={(value) => void update('notificationsEnabled', value)} />
            </View>
            <View style={styles.row}>
              <Text style={styles.label} translate>Anonymous by default</Text>
              <Switch label="Anonymous default" value={profile.settings.anonymousDefault} onValueChange={(value) => void update('anonymousDefault', value)} />
            </View>
            <View style={styles.row}>
              <Text style={styles.label} translate>Vibration</Text>
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
    borderColor: Colors.slate,
    backgroundColor: Colors.bgSurface,
    padding: S.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  languageCard: {
    borderRadius: R.md,
    borderWidth: S.px,
    borderColor: Colors.slate,
    backgroundColor: Colors.bgSurface,
    padding: S.lg,
    gap: S.md,
  },
  languageOptions: {
    flexDirection: 'row',
    gap: S.sm,
  },
  languageOption: {
    flex: 1,
    minHeight: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: R.sm,
    borderWidth: S.px,
    borderColor: Colors.slate,
  },
  languageOptionActive: {
    borderColor: Colors.ledger,
    backgroundColor: Colors.ledger,
  },
  languageText: {
    color: Colors.dossier,
    fontFamily: F.family.bodySemi,
    fontSize: F.size.sm,
  },
  languageTextActive: {
    color: Colors.dossier,
  },
  label: {
    color: Colors.dossier,
    fontFamily: F.family.bodySemi,
    fontSize: F.size.base,
  },
});
