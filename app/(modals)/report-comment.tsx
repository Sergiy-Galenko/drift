import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { Header } from '@/components/navigation/Header';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Colors, F, R, S } from '@/constants/tokens';
import { createCommentReport } from '@/lib/firebase/comments';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';
import { firebaseErrorMessage } from '@/utils/formatters';
import { logger } from '@/utils/logger';

const reasons = ['spam', 'harassment', 'inappropriate', 'other'] as const;

export default function ReportCommentScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ driftId?: string; commentId?: string }>();
  const uid = useAuthStore((state) => state.firebaseUser?.uid);
  const pushToast = useUIStore((state) => state.pushToast);
  const [reason, setReason] = useState<(typeof reasons)[number]>('spam');
  const [details, setDetails] = useState('');
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (!uid || typeof params.driftId !== 'string' || typeof params.commentId !== 'string') {
      pushToast({ title: 'Report unavailable', message: 'Sign in and try again.', tone: 'warning' });
      return;
    }
    setSaving(true);
    try {
      await createCommentReport({ driftId: params.driftId, commentId: params.commentId, reporterUid: uid, reason, details });
      pushToast({ title: 'Report sent', message: 'Moderation will review this comment.', tone: 'success' });
      router.back();
    } catch (error) {
      logger.error('Comment report failed', { error: String(error) });
      pushToast({ title: 'Report failed', message: firebaseErrorMessage(String(error)), tone: 'danger' });
    } finally {
      setSaving(false);
    }
  };

  return <View style={styles.root}><Header title="Report comment" showBack /><View style={styles.content}><View style={styles.reasons}>{reasons.map((item) => <Pressable key={item} onPress={() => setReason(item)} style={[styles.reason, reason === item ? styles.selected : null]}><Text style={[styles.reasonText, reason === item ? styles.selectedText : null]}>{item.toUpperCase()}</Text></Pressable>)}</View><Input label="Details (optional)" value={details} onChangeText={setDetails} multiline style={styles.details} /><Button label="Submit report" variant="danger" onPress={() => void submit()} loading={saving} /></View></View>;
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bgBase }, content: { padding: S.lg, gap: S.lg }, reasons: { gap: S.sm },
  reason: { borderRadius: R.md, borderWidth: S.px, borderColor: Colors.stroke, backgroundColor: Colors.bgSurface, padding: S.md }, selected: { borderColor: Colors.accentFire },
  reasonText: { color: Colors.textSecondary, fontFamily: F.family.monoBold, fontSize: F.size.xs }, selectedText: { color: Colors.accentFire }, details: { minHeight: 120, textAlignVertical: 'top' },
});
