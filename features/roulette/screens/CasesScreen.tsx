import { useCallback, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Header } from '@/components/navigation/Header';
import { Colors, F, R, S } from '@/constants/tokens';
import { useHaptics } from '@/hooks/useHaptics';
import { useAuthStore } from '@/stores/authStore';

import { CardRevealModal } from '../components/CardRevealModal';
import { CaseCard } from '../components/CaseCard';
import {
  getRouletteCaseViews,
  useRouletteStore,
} from '../store/useRouletteStore';
import type { OpenCaseResult } from '../types/roulette.types';

export function CasesScreen() {
  const haptics = useHaptics();
  const profile = useAuthStore((state) => state.profile);
  const userState = useRouletteStore((state) => state.userState);
  const committing = useRouletteStore((state) => state.committing);
  const openCase = useRouletteStore((state) => state.openCase);
  const [openingCaseId, setOpeningCaseId] = useState<string | null>(null);
  const [revealResult, setRevealResult] = useState<OpenCaseResult | null>(null);
  const cases = useMemo(() => getRouletteCaseViews(userState, profile), [profile, userState]);

  const handleOpen = useCallback(
    (caseId: string) => {
      void haptics.selection();
      const result = openCase(caseId, profile);

      if (!result) {
        return;
      }

      setOpeningCaseId(caseId);
      setRevealResult(null);
      setTimeout(() => {
        setOpeningCaseId(null);
        void haptics.impactHeavy();
        if (result.card.rarity !== 'common') {
          void haptics.notifySuccess();
        }
        setRevealResult(result);
      }, 920);
    },
    [haptics, openCase, profile],
  );

  return (
    <View style={styles.root}>
      <Header title="Cases" showBack />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.summary}>
          <Text style={styles.title}>Special cases</Text>
          <Text style={styles.copy}>Achievement cases open from profile milestones. Purchase cases currently spend spin tokens until the payment backend is wired.</Text>
          <Text style={styles.tokens}>{userState?.spinTokens ?? 0} spin tokens available</Text>
        </View>
        {cases.map((item) => (
          <CaseCard
            key={item.id}
            item={{ ...item, canOpen: item.canOpen && !committing }}
            opening={openingCaseId === item.id}
            onOpen={handleOpen}
          />
        ))}
      </ScrollView>
      <CardRevealModal
        visible={Boolean(revealResult)}
        card={revealResult?.card ?? null}
        isDuplicate={Boolean(revealResult?.isDuplicate)}
        duplicateCount={revealResult?.duplicateCount ?? 1}
        onClose={() => setRevealResult(null)}
      />
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
    paddingBottom: S.x7,
    gap: S.md,
  },
  summary: {
    borderRadius: R.md,
    borderWidth: S.px,
    borderColor: Colors.stroke,
    backgroundColor: Colors.bgSurface,
    padding: S.lg,
    gap: S.sm,
  },
  title: {
    color: Colors.textPrimary,
    fontFamily: F.family.displayBold,
    fontSize: F.size.xl,
  },
  copy: {
    color: Colors.textSecondary,
    fontFamily: F.family.bodyRegular,
    fontSize: F.size.sm,
    lineHeight: F.size.sm * F.lineHeight.normal,
  },
  tokens: {
    color: Colors.accentVolt,
    fontFamily: F.family.monoBold,
    fontSize: F.size.sm,
  },
});
