import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { DriftCard } from '@/components/drift/DriftCard';
import { Header } from '@/components/navigation/Header';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Input } from '@/components/ui/Input';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { CATEGORY_ORDER, CATEGORIES } from '@/constants/categories';
import { Colors, F, R, S } from '@/constants/tokens';
import { createDrift } from '@/lib/firebase/drifts';
import { useAuthStore } from '@/stores/authStore';
import { useDraftStore } from '@/stores/draftStore';
import { useUIStore } from '@/stores/uiStore';
import type { Drift } from '@/types/drift';
import { firebaseErrorMessage } from '@/utils/formatters';
import { logger } from '@/utils/logger';
import { CreateDriftSchema } from '@/utils/validation';

export default function CreateScreen() {
  const router = useRouter();
  const profile = useAuthStore((state) => state.profile);
  const draft = useDraftStore();
  const pushToast = useUIStore((state) => state.pushToast);
  const [submitting, setSubmitting] = useState(false);
  const step = draft.currentStep;

  const preview = useMemo<Drift | null>(() => {
    if (!profile || !draft.category) return null;
    const now = new Date();
    return {
      id: 'preview',
      authorUid: profile.uid,
      authorUsername: draft.isAnonymous ? 'ghost' : profile.username,
      authorReputationScore: profile.reputationScore,
      text: draft.text || 'Should I commit to this decision?',
      stake: draft.stake || 'The stake goes here.',
      context: draft.context || null,
      votesYes: 8,
      votesNo: 5,
      voters: {},
      status: 'active',
      result: null,
      createdAt: now,
      expiresAt: new Date(now.getTime() + 24 * 3600 * 1000),
      decidedAt: null,
      proofUrl: null,
      proofType: null,
      proofUploadedAt: null,
      proofDeadline: null,
      category: draft.category,
      tags: [],
      isAnonymous: draft.isAnonymous,
      viewCount: 0,
      shareCount: 0,
      bookmarkCount: 0,
      commentCount: 0,
      isFeatured: false,
      featuredAt: null,
      isNSFW: false,
      reportCount: 0,
    };
  }, [draft.category, draft.context, draft.isAnonymous, draft.stake, draft.text, profile]);

  if (!profile) {
    return (
      <View style={styles.root}>
        <Header title="Create" />
        <EmptyState title="Profile required" message="Choose a username before posting a drift." />
      </View>
    );
  }

  const next = () => draft.saveDraft({ currentStep: Math.min(3, step + 1) });
  const back = () => draft.saveDraft({ currentStep: Math.max(0, step - 1) });

  const submit = async () => {
    const parsed = CreateDriftSchema.safeParse({
      text: draft.text,
      stake: draft.stake,
      context: draft.context || undefined,
      category: draft.category,
      isAnonymous: draft.isAnonymous,
    });

    if (!parsed.success) {
      pushToast({ title: 'Drift incomplete', message: parsed.error.issues[0]?.message, tone: 'warning' });
      return;
    }

    setSubmitting(true);
    try {
      const driftId = await createDrift(parsed.data, profile);
      draft.clearDraft();
      router.push({ pathname: '/(drift)/[id]', params: { id: driftId } });
    } catch (error) {
      logger.error('Create drift failed', { error: String(error) });
      pushToast({ title: 'Create failed', message: firebaseErrorMessage(String(error)), tone: 'danger' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.root}>
      <Header title="Create Drift" />
      <ScrollView contentContainerStyle={styles.content}>
        <ProgressBar progress={(step + 1) / 4} />
        {step === 0 ? (
          <Input
            label="Decision"
            multiline
            maxLength={200}
            value={draft.text}
            onChangeText={(text) => draft.saveDraft({ text })}
            placeholder="Should I quit my job and freelance for 30 days?"
            style={styles.multiline}
          />
        ) : null}
        {step === 1 ? (
          <Input
            label="Stake"
            multiline
            maxLength={100}
            value={draft.stake}
            onChangeText={(stake) => draft.saveDraft({ stake })}
            placeholder="If YES wins, I submit notice this week."
            style={styles.multilineSmall}
          />
        ) : null}
        {step === 2 ? (
          <View style={styles.step}>
            <Input
              label="Context"
              multiline
              maxLength={300}
              value={draft.context}
              onChangeText={(context) => draft.saveDraft({ context })}
              placeholder="Add the real-world context voters need."
              style={styles.multiline}
            />
            <View style={styles.categoryGrid}>
              {CATEGORY_ORDER.map((category) => {
                const selected = draft.category === category;
                return (
                  <Pressable
                    key={category}
                    onPress={() => draft.saveDraft({ category })}
                    style={[styles.category, selected ? styles.categorySelected : null]}
                  >
                    <Text style={[styles.categoryText, selected ? styles.categorySelectedText : null]}>
                      {CATEGORIES[category].label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
            <Pressable onPress={() => draft.saveDraft({ isAnonymous: !draft.isAnonymous })} style={styles.toggleRow}>
              <Text style={styles.toggleLabel}>POST ANONYMOUSLY</Text>
              <Text style={styles.toggleValue}>{draft.isAnonymous ? 'ON' : 'OFF'}</Text>
            </Pressable>
          </View>
        ) : null}
        {step === 3 && preview ? <DriftCard drift={preview} preview /> : null}
        <View style={styles.nav}>
          <Button label="Back" variant="secondary" onPress={back} disabled={step === 0 || submitting} />
          <Button label={step === 3 ? 'Launch drift' : 'Next'} onPress={step === 3 ? () => void submit() : next} loading={submitting} />
        </View>
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
    padding: S.md,
    paddingBottom: S.x7,
    gap: S.lg,
  },
  step: {
    gap: S.lg,
  },
  multiline: {
    minHeight: 150,
    textAlignVertical: 'top',
  },
  multilineSmall: {
    minHeight: 112,
    textAlignVertical: 'top',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: S.md,
  },
  category: {
    borderRadius: R.sm,
    borderWidth: S.px,
    borderColor: Colors.strokeStrong,
    backgroundColor: Colors.surfaceRaised,
    paddingHorizontal: S.lg,
    paddingVertical: S.md,
  },
  categorySelected: {
    backgroundColor: Colors.white,
    borderColor: Colors.white,
  },
  categoryText: {
    color: Colors.textPrimary,
    fontFamily: F.family.monoBold,
    fontSize: F.size.sm,
  },
  categorySelectedText: {
    color: Colors.black,
  },
  toggleRow: {
    borderRadius: R.sm,
    borderWidth: S.px,
    borderColor: Colors.strokeStrong,
    backgroundColor: Colors.surfaceRaised,
    padding: S.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  toggleLabel: {
    color: Colors.textSecondary,
    fontFamily: F.family.monoBold,
    fontSize: F.size.sm,
  },
  toggleValue: {
    color: Colors.blue,
    fontFamily: F.family.monoBold,
    fontSize: F.size.sm,
  },
  nav: {
    flexDirection: 'row',
    gap: S.md,
  },
});
