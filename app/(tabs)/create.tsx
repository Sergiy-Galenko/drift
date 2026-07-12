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
        <Header title="Create" showBack />
        <EmptyState title="Profile required" message="Choose a username before posting a drift." />
      </View>
    );
  }

  const next = () => {
    // Validate current step before proceeding
    if (step === 0 && !draft.text?.trim()) {
      pushToast({ 
        title: 'Decision required', 
        message: 'Please enter a decision before continuing.', 
        tone: 'warning' 
      });
      return;
    }
    if (step === 1 && !draft.stake?.trim()) {
      pushToast({ 
        title: 'Stake required', 
        message: 'Please enter a stake before continuing.', 
        tone: 'warning' 
      });
      return;
    }
    if (step === 2 && !draft.category) {
      pushToast({ 
        title: 'Category required', 
        message: 'Please select a category before continuing.', 
        tone: 'warning' 
      });
      return;
    }
    draft.saveDraft({ currentStep: Math.min(3, step + 1) });
  };

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
      pushToast({ 
        title: 'Drift incomplete', 
        message: parsed.error.issues[0]?.message, 
        tone: 'warning' 
      });
      return;
    }

    setSubmitting(true);
    try {
      const driftId = await createDrift(parsed.data, profile);
      draft.clearDraft();
      router.push({ pathname: '/(drift)/[id]', params: { id: driftId } });
    } catch (error) {
      logger.error('Create drift failed', { error: String(error) });
      pushToast({ 
        title: 'Create failed', 
        message: firebaseErrorMessage(String(error)), 
        tone: 'danger' 
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCategorySelect = (category: string) => {
    draft.saveDraft({ category });
  };

  const handleAnonymousToggle = () => {
    draft.saveDraft({ isAnonymous: !draft.isAnonymous });
  };

  return (
    <View style={styles.root}>
      <Header title="Create Drift" showBack />
      <ScrollView 
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <ProgressBar progress={(step + 1) / 4} />
        
        {step === 0 && (
          <Input
            label="Decision"
            multiline
            maxLength={200}
            value={draft.text}
            onChangeText={(text) => draft.saveDraft({ text })}
            placeholder="Should I quit my job and freelance for 30 days?"
            style={styles.multiline}
          />
        )}
        
        {step === 1 && (
          <Input
            label="Stake"
            multiline
            maxLength={100}
            value={draft.stake}
            onChangeText={(stake) => draft.saveDraft({ stake })}
            placeholder="If YES wins, I submit notice this week."
            style={styles.multilineSmall}
          />
        )}
        
        {step === 2 && (
          <View style={styles.step}>
            <Input
              label="Context (optional)"
              multiline
              maxLength={300}
              value={draft.context || ''}
              onChangeText={(context) => draft.saveDraft({ context })}
              placeholder="Add the real-world context voters need."
              style={styles.multiline}
            />
            
            <Text style={styles.sectionLabel}>Select Category</Text>
            <View style={styles.categoryGrid}>
              {CATEGORY_ORDER.map((category) => {
                const isSelected = draft.category === category;
                return (
                  <Pressable
                    key={category}
                    onPress={() => handleCategorySelect(category)}
                    style={[
                      styles.category,
                      isSelected && styles.categorySelected,
                    ]}
                    accessibilityRole="button"
                    accessibilityLabel={`Select ${CATEGORIES[category].label} category`}
                  >
                    <Text style={[
                      styles.categoryText,
                      isSelected && styles.categorySelectedText,
                    ]}>
                      {CATEGORIES[category].label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
            
            <Pressable 
              onPress={handleAnonymousToggle} 
              style={styles.toggleRow}
              accessibilityRole="button"
            >
              <Text style={styles.toggleLabel}>POST ANONYMOUSLY</Text>
              <View style={styles.toggleIndicator}>
                <Text style={[
                  styles.toggleValue,
                  draft.isAnonymous && styles.toggleValueActive
                ]}>
                  {draft.isAnonymous ? 'ON' : 'OFF'}
                </Text>
              </View>
            </Pressable>
          </View>
        )}
        
        {step === 3 && preview && (
          <View style={styles.previewContainer}>
            <Text style={styles.previewLabel}>Preview</Text>
            <DriftCard drift={preview} preview />
          </View>
        )}
        
        <View style={styles.nav}>
          <Button 
            label="Back" 
            variant="secondary" 
            onPress={back} 
            disabled={step === 0 || submitting} 
          />
          <Button 
            label={step === 3 ? 'Launch drift' : 'Next'} 
            onPress={step === 3 ? () => void submit() : next} 
            loading={submitting} 
          />
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
  sectionLabel: {
    color: Colors.textSecondary,
    fontFamily: F.family.monoBold,
    fontSize: F.size.sm,
    marginBottom: -S.sm,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: S.md,
  },
  category: {
    borderRadius: R.sm,
    borderWidth: 1,
    borderColor: Colors.strokeStrong,
    backgroundColor: Colors.surfaceRaised,
    paddingHorizontal: S.lg,
    paddingVertical: S.md,
    minWidth: 80,
    alignItems: 'center',
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
    borderWidth: 1,
    borderColor: Colors.strokeStrong,
    backgroundColor: Colors.surfaceRaised,
    padding: S.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  toggleLabel: {
    color: Colors.textSecondary,
    fontFamily: F.family.monoBold,
    fontSize: F.size.sm,
  },
  toggleIndicator: {
    backgroundColor: Colors.bgBase,
    paddingHorizontal: S.md,
    paddingVertical: S.xs,
    borderRadius: R.sm,
  },
  toggleValue: {
    color: Colors.textSecondary,
    fontFamily: F.family.monoBold,
    fontSize: F.size.sm,
  },
  toggleValueActive: {
    color: Colors.blue,
  },
  previewContainer: {
    gap: S.md,
  },
  previewLabel: {
    color: Colors.textSecondary,
    fontFamily: F.family.monoBold,
    fontSize: F.size.sm,
    textAlign: 'center',
  },
  nav: {
    flexDirection: 'row',
    gap: S.md,
    marginTop: S.md,
  },
});