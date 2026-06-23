import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { Header } from '@/components/navigation/Header';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Colors, F, R, S } from '@/constants/tokens';
import { createReport } from '@/lib/firebase/drifts';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';
import type { ReportDoc } from '@/types/drift';
import { firebaseErrorMessage } from '@/utils/formatters';
import { logger } from '@/utils/logger';

const reasons: ReportDoc['reason'][] = ['fake_commitment', 'spam', 'harassment', 'inappropriate', 'other'];

export default function ReportScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ driftId?: string }>();
  const driftId = typeof params.driftId === 'string' ? params.driftId : undefined;
  const uid = useAuthStore((state) => state.firebaseUser?.uid);
  const pushToast = useUIStore((state) => state.pushToast);
  const [reason, setReason] = useState<ReportDoc['reason']>('fake_commitment');
  const [details, setDetails] = useState('');
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (!uid || !driftId) {
      pushToast({ title: 'Report unavailable', message: 'Sign in before reporting.', tone: 'warning' });
      return;
    }

    setSaving(true);
    try {
      await createReport({ driftId, reporterUid: uid, reason, details });
      pushToast({ title: 'Report sent', message: 'Moderation will review it.', tone: 'success' });
      router.back();
    } catch (error) {
      logger.error('Report failed', { error: String(error) });
      pushToast({ title: 'Report failed', message: firebaseErrorMessage(String(error)), tone: 'danger' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.root}>
      <Header title="Report Drift" showBack />
      <View style={styles.content}>
        <View style={styles.reasons}>
          {reasons.map((item) => (
            <Pressable key={item} onPress={() => setReason(item)} style={[styles.reason, reason === item ? styles.active : null]}>
              <Text style={[styles.reasonText, reason === item ? styles.activeText : null]}>{item.replace('_', ' ').toUpperCase()}</Text>
            </Pressable>
          ))}
        </View>
        <Input label="Details" value={details} onChangeText={setDetails} multiline style={styles.details} />
        <Button label="Submit report" variant="danger" onPress={() => void submit()} loading={saving} />
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
  reasons: {
    gap: S.sm,
  },
  reason: {
    borderRadius: R.md,
    borderWidth: S.px,
    borderColor: Colors.stroke,
    backgroundColor: Colors.bgSurface,
    padding: S.md,
  },
  active: {
    borderColor: Colors.accentFire,
  },
  reasonText: {
    color: Colors.textSecondary,
    fontFamily: F.family.monoBold,
    fontSize: F.size.xs,
  },
  activeText: {
    color: Colors.accentFire,
  },
  details: {
    minHeight: 140,
    textAlignVertical: 'top',
  },
});
