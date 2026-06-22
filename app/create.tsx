import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { useRouter } from 'expo-router';
import Animated, { LinearTransition, SlideInLeft, SlideInRight, SlideOutLeft, SlideOutRight } from 'react-native-reanimated';
import { z } from 'zod';

import { DriftCard } from '@/components/drift/DriftCard';
import { AppHeader } from '@/components/layout/AppHeader';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';
import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/TextField';
import { categories } from '@/constants/categories';
import { colors } from '@/constants/colors';
import { fontFamily, radius } from '@/constants/typography';
import { useAuth } from '@/hooks/useAuth';
import { useCreateDrift } from '@/hooks/useCreateDrift';
import type { CreateDriftInput, Drift } from '@/types/drift';

const createDriftSchema = z.object({
  text: z.string().trim().min(10, 'Give the crowd enough context.').max(200, 'Keep it under 200 characters.'),
  stake: z.string().trim().min(5, 'Make the commitment concrete.').max(100, 'Keep it under 100 characters.'),
  category: z.enum(categories),
  isAnonymous: z.boolean(),
});

type CreateDriftFormValues = z.infer<typeof createDriftSchema>;

const previewCreatedAt = new Date('2100-01-01T00:00:00.000Z');
const previewExpiresAt = new Date('2100-01-02T00:00:00.000Z');

export default function CreateScreen() {
  const router = useRouter();
  const auth = useAuth();
  const create = useCreateDrift();
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);

  const {
    control,
    handleSubmit,
    setValue,
    trigger,
    formState: { errors },
  } = useForm<CreateDriftFormValues>({
    resolver: zodResolver(createDriftSchema),
    defaultValues: {
      text: '',
      stake: '',
      category: 'life',
      isAnonymous: false,
    },
  });

  const values = useWatch({ control });
  const text = values.text ?? '';
  const stake = values.stake ?? '';
  const category = values.category ?? 'life';
  const isAnonymous = values.isAnonymous ?? false;

  useEffect(() => {
    if (auth.initialized && !auth.profile) {
      router.replace('/auth');
    }
  }, [auth.initialized, auth.profile, router]);

  const previewDrift = useMemo<Drift>(() => {
    return {
      id: 'preview',
      authorUid: auth.profile?.uid ?? 'preview',
      authorUsername: isAnonymous ? 'ghost' : auth.profile?.username ?? 'you',
      text: text || 'What decision is weighing on you right now?',
      stake: stake || 'Book the flight tonight. No take-backs.',
      votesYes: 0,
      votesNo: 0,
      voters: {},
      status: 'active',
      result: null,
      createdAt: previewCreatedAt,
      expiresAt: previewExpiresAt,
      proofUrl: null,
      proofUploadedAt: null,
      category,
      isAnonymous,
      viewCount: 0,
    };
  }, [auth.profile?.uid, auth.profile?.username, category, isAnonymous, stake, text]);

  const goNext = async () => {
    const fields: (keyof CreateDriftFormValues)[] =
      step === 0 ? ['text'] : step === 1 ? ['stake'] : step === 2 ? ['category', 'isAnonymous'] : [];
    const valid = fields.length === 0 ? true : await trigger(fields);

    if (!valid) {
      return;
    }

    setDirection(1);
    setStep((current) => Math.min(3, current + 1));
  };

  const goBack = () => {
    setDirection(-1);
    setStep((current) => Math.max(0, current - 1));
  };

  const submit = handleSubmit(async (input: CreateDriftInput) => {
    const driftId = await create.launch(input);
    router.replace({ pathname: '/drift/[id]', params: { id: driftId } });
  });

  return (
    <ScreenWrapper showTabs scroll keyboard>
      <AppHeader title="Create" eyebrow="LAUNCH A DRIFT" />
      <StepDots step={step} />

      <Animated.View
        key={step}
        entering={direction > 0 ? SlideInRight.duration(160) : SlideInLeft.duration(160)}
        exiting={direction > 0 ? SlideOutLeft.duration(120) : SlideOutRight.duration(120)}
        style={styles.step}
      >
        {step === 0 ? (
          <Controller
            control={control}
            name="text"
            render={({ field }) => (
              <TextField
                multiline
                maxLength={200}
                value={field.value}
                onBlur={field.onBlur}
                onChangeText={field.onChange}
                placeholder="What decision is weighing on you right now?"
                error={errors.text?.message}
                counter={`${field.value.length}/200`}
                dangerCounter={field.value.length >= 180}
              />
            )}
          />
        ) : null}

        {step === 1 ? (
          <Controller
            control={control}
            name="stake"
            render={({ field }) => (
              <TextField
                maxLength={100}
                value={field.value}
                onBlur={field.onBlur}
                onChangeText={field.onChange}
                label="If YES wins, I will..."
                placeholder="Book the flight tonight. No take-backs."
                error={errors.stake?.message}
                counter={`${field.value.length}/100`}
                dangerCounter={field.value.length >= 85}
              />
            )}
          />
        ) : null}

        {step === 2 ? (
          <View style={styles.detailStep}>
            <Text style={styles.sectionTitle}>Category</Text>
            <View style={styles.categoryGrid}>
              {categories.map((option) => {
                const active = category === option;
                return (
                  <Pressable
                    key={option}
                    onPress={() => setValue('category', option, { shouldValidate: true })}
                    style={[styles.category, active ? styles.categoryActive : null]}
                  >
                    <Text style={[styles.categoryText, active ? styles.categoryTextActive : null]}>{option.toUpperCase()}</Text>
                  </Pressable>
                );
              })}
            </View>

            <View style={styles.toggleRow}>
              <View style={styles.toggleCopy}>
                <Text style={styles.sectionTitle}>Post anonymously</Text>
                <Text style={styles.muted}>Your profile stays hidden, but the commitment still counts.</Text>
              </View>
              <CustomSwitch value={isAnonymous} onValueChange={(next) => setValue('isAnonymous', next)} />
            </View>
          </View>
        ) : null}

        {step === 3 ? (
          <View style={styles.preview}>
            <Text style={styles.sectionTitle}>Preview</Text>
            <DriftCard drift={previewDrift} preview />
            {create.error ? <Text style={styles.error}>{create.error}</Text> : null}
            <Button label="Launch Drift" variant="primary" fullWidth loading={create.loading} onPress={submit} />
          </View>
        ) : null}
      </Animated.View>

      <View style={styles.navRow}>
        {step > 0 ? <Button label="Back" variant="ghost" onPress={goBack} /> : <View />}
        {step < 3 ? <Button label="Next" variant="primary" onPress={goNext} /> : null}
      </View>
    </ScreenWrapper>
  );
}

function StepDots({ step }: { step: number }) {
  return (
    <View style={styles.dots}>
      {[0, 1, 2, 3].map((index) => (
        <Animated.View
          key={index}
          layout={LinearTransition.duration(140)}
          style={[styles.dot, index === step ? styles.dotActive : null]}
        />
      ))}
    </View>
  );
}

function CustomSwitch({ value, onValueChange }: { value: boolean; onValueChange: (value: boolean) => void }) {
  return (
    <Pressable onPress={() => onValueChange(!value)} style={[styles.switchTrack, value ? styles.switchTrackActive : null]}>
      <View style={[styles.switchThumb, value ? styles.switchThumbActive : null]} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 7,
    marginBottom: 22,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.textGhost,
  },
  dotActive: {
    width: 28,
    backgroundColor: colors.volt,
  },
  step: {
    minHeight: 390,
  },
  detailStep: {
    gap: 18,
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontFamily: fontFamily.bodySemiBold,
    fontSize: 14,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  category: {
    minWidth: '30%',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.stroke,
    backgroundColor: colors.surface,
    paddingVertical: 14,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  categoryActive: {
    borderColor: colors.volt,
  },
  categoryText: {
    color: colors.textMuted,
    fontFamily: fontFamily.monoBold,
    fontSize: 11,
  },
  categoryTextActive: {
    color: colors.volt,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 18,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.stroke,
    backgroundColor: colors.surface,
    padding: 14,
  },
  toggleCopy: {
    flex: 1,
    gap: 4,
  },
  muted: {
    color: colors.textMuted,
    fontFamily: fontFamily.body,
    fontSize: 13,
    lineHeight: 18,
  },
  switchTrack: {
    width: 54,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.textGhost,
    padding: 3,
  },
  switchTrackActive: {
    backgroundColor: colors.volt,
  },
  switchThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.textMuted,
  },
  switchThumbActive: {
    transform: [{ translateX: 24 }],
    backgroundColor: colors.base,
  },
  preview: {
    gap: 14,
  },
  error: {
    color: colors.fire,
    fontFamily: fontFamily.bodyMedium,
    fontSize: 13,
  },
  navRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 18,
  },
});
