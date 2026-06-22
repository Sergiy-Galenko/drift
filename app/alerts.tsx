import { StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { AppHeader } from '@/components/layout/AppHeader';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';
import { Button } from '@/components/ui/Button';
import { colors } from '@/constants/colors';
import { fontFamily } from '@/constants/typography';

export default function AlertsScreen() {
  const router = useRouter();

  return (
    <ScreenWrapper showTabs>
      <AppHeader title="Alerts" eyebrow="SOON" />
      <View style={styles.empty}>
        <Text style={styles.title}>No alerts yet.</Text>
        <Text style={styles.copy}>Proof reminders and vote results will land here.</Text>
        <Button label="Back to feed" variant="primary" onPress={() => router.push('/feed')} />
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-start',
    gap: 10,
  },
  title: {
    color: colors.textPrimary,
    fontFamily: fontFamily.displayBold,
    fontSize: 26,
  },
  copy: {
    color: colors.textMuted,
    fontFamily: fontFamily.body,
    fontSize: 14,
  },
});
