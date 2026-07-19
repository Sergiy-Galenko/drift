import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { Header } from '@/components/navigation/Header';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Input } from '@/components/ui/Input';
import { Spinner } from '@/components/ui/Spinner';
import { CATEGORY_ORDER, CATEGORIES } from '@/constants/categories';
import { Colors, F, R, S } from '@/constants/tokens';
import { useDrift } from '@/hooks/useDrift';
import { updateDrift } from '@/lib/firebase/drifts';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';
import type { DriftCategory } from '@/types/drift';
import { firebaseErrorMessage } from '@/utils/formatters';
import { logger } from '@/utils/logger';
import { CreateDriftSchema } from '@/utils/validation';

export default function EditDriftScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string }>();
  const driftId = typeof params.id === 'string' ? params.id : undefined;
  const uid = useAuthStore((state) => state.firebaseUser?.uid);
  const pushToast = useUIStore((state) => state.pushToast);
  const { drift, loading } = useDrift(driftId);
  const [text, setText] = useState('');
  const [stake, setStake] = useState('');
  const [context, setContext] = useState('');
  const [category, setCategory] = useState<DriftCategory>('life');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (drift) {
      setText(drift.text);
      setStake(drift.stake);
      setContext(drift.context ?? '');
      setCategory(drift.category);
    }
  }, [drift]);

  const save = async () => {
    if (!drift || !uid) return;
    const parsed = CreateDriftSchema.safeParse({ text, stake, context: context || undefined, category, isAnonymous: drift.isAnonymous });
    if (!parsed.success) {
      pushToast({ title: 'Check your changes', message: parsed.error.issues[0]?.message, tone: 'warning' });
      return;
    }
    setSaving(true);
    try {
      await updateDrift(drift.id, uid, parsed.data);
      pushToast({ title: 'Drift updated', message: 'Your changes are live.', tone: 'success' });
      router.back();
    } catch (error) {
      logger.error('Update drift failed', { error: String(error) });
      pushToast({ title: 'Update failed', message: firebaseErrorMessage(String(error)), tone: 'danger' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <View style={styles.root}><Header title="Edit drift" showBack /><Spinner label="Loading drift" /></View>;
  if (!drift || drift.authorUid !== uid || drift.status !== 'active') {
    return <View style={styles.root}><Header title="Edit drift" showBack /><EmptyState title="Editing unavailable" message="Only active drifts created by you can be edited." /></View>;
  }

  return (
    <View style={styles.root}>
      <Header title="Edit drift" showBack />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Input label="Decision" value={text} onChangeText={setText} multiline maxLength={200} style={styles.multiline} />
        <Input label="Stake" value={stake} onChangeText={setStake} multiline maxLength={100} style={styles.smallMultiline} />
        <Input label="Context (optional)" value={context} onChangeText={setContext} multiline maxLength={300} style={styles.multiline} />
        <Text style={styles.label}>CATEGORY</Text>
        <View style={styles.categories}>{CATEGORY_ORDER.map((item) => <Pressable key={item} onPress={() => setCategory(item)} style={[styles.category, category === item ? styles.selected : null]}><Text style={[styles.categoryText, category === item ? styles.selectedText : null]}>{CATEGORIES[item].label}</Text></Pressable>)}</View>
        <Button label="Save changes" onPress={() => void save()} loading={saving} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bgBase }, content: { padding: S.lg, paddingBottom: S.x7, gap: S.lg },
  multiline: { minHeight: 120, textAlignVertical: 'top' }, smallMultiline: { minHeight: 88, textAlignVertical: 'top' },
  label: { color: Colors.textSecondary, fontFamily: F.family.monoBold, fontSize: F.size.sm },
  categories: { flexDirection: 'row', flexWrap: 'wrap', gap: S.sm },
  category: { borderRadius: R.sm, borderWidth: S.px, borderColor: Colors.strokeStrong, paddingHorizontal: S.md, paddingVertical: S.sm },
  selected: { backgroundColor: Colors.white, borderColor: Colors.white }, categoryText: { color: Colors.textSecondary, fontFamily: F.family.bodySemi, fontSize: F.size.sm }, selectedText: { color: Colors.black },
});
