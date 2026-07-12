import { useCallback, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { BoxIcon, GridIcon, MarketIcon } from '@/components/icons';
import { Header } from '@/components/navigation/Header';
import { IconButton } from '@/components/ui/IconButton';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Colors, F, R, S } from '@/constants/tokens';
import { useHaptics } from '@/hooks/useHaptics';

import { CardRevealModal } from '../components/CardRevealModal';
import { RouletteWheel } from '../components/RouletteWheel';
import { getCardsByIds, MAIN_ROULETTE_CARD_IDS } from '../config/cardsData';
import { ROULETTE_SPIN_COST, SPIN_PACK_PRICE_LABEL } from '../config/rouletteConfig';
import {
  getRouletteProgress,
  SPIN_PACK_SIZE,
  useRouletteStore,
} from '../store/useRouletteStore';
import type { SpinResult } from '../types/roulette.types';

export function RouletteScreen() {
  const router = useRouter();
  const haptics = useHaptics();
  const userState = useRouletteStore((state) => state.userState);
  const committing = useRouletteStore((state) => state.committing);
  const spin = useRouletteStore((state) => state.spin);
  const grantTokens = useRouletteStore((state) => state.grantTokens);
  const [spinNonce, setSpinNonce] = useState(0);
  const [wheelResult, setWheelResult] = useState<SpinResult | null>(null);
  const [revealResult, setRevealResult] = useState<SpinResult | null>(null);
  const [wheelSpinning, setWheelSpinning] = useState(false);
  const cards = useMemo(() => getCardsByIds(MAIN_ROULETTE_CARD_IDS), []);
  const progress = getRouletteProgress(userState);
  const spinDisabled = !userState || userState.spinTokens < ROULETTE_SPIN_COST || wheelSpinning || committing;

  const startSpin = useCallback(() => {
    void haptics.selection();
    const result = spin();

    if (!result) {
      return;
    }

    setRevealResult(null);
    setWheelResult(result);
    setWheelSpinning(true);
    setSpinNonce((value) => value + 1);
  }, [haptics, spin]);

  const onWheelSettled = useCallback(() => {
    setWheelSpinning(false);

    if (!wheelResult) {
      return;
    }

    void haptics.impactHeavy();
    if (wheelResult.card.rarity !== 'common') {
      void haptics.notifySuccess();
    }
    setRevealResult(wheelResult);
  }, [haptics, wheelResult]);

  return (
    <View style={styles.root}>
      <Header
        title="Roulette"
        showBack
        right={
          <View style={styles.headerActions}>
            <IconButton icon={GridIcon} label="Collection" onPress={() => router.push('/(roulette)/collection')} />
            <IconButton icon={BoxIcon} label="Cases" onPress={() => router.push('/(roulette)/cases')} />
            <IconButton icon={MarketIcon} label="Market" onPress={() => router.push('/(roulette)/market')} />
          </View>
        }
      />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.metrics}>
          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>{userState?.spinTokens ?? 0}</Text>
            <Text style={styles.metricLabel}>Spin tokens</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>{progress.collected}/{progress.total}</Text>
            <Text style={styles.metricLabel}>Collected</Text>
          </View>
        </View>

        <View style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <Text style={styles.sectionTitle}>Collection progress</Text>
            <Text style={styles.progressText}>{Math.round(progress.progress * 100)}%</Text>
          </View>
          <ProgressBar progress={progress.progress} tone="volt" />
        </View>

        <View style={styles.reelBlock}>
          <View style={styles.reelHeader}>
            <Text style={styles.sectionTitle}>Main pool</Text>
            <Text style={styles.reelMeta}>70 / 25 / 5 weighted rarity</Text>
          </View>
          <RouletteWheel cards={cards} resultCard={wheelResult?.card ?? null} spinNonce={spinNonce} onSettled={onWheelSettled} />
        </View>

        <View style={styles.actions}>
          <Button label={`Spin - ${ROULETTE_SPIN_COST} token`} onPress={startSpin} disabled={spinDisabled} loading={wheelSpinning} />
          <View style={styles.secondaryActions}>
            <Button label="Claim +1 activity" variant="secondary" onPress={() => grantTokens(1, 'daily_activity')} disabled={committing} />
            <Button label={`Buy +${SPIN_PACK_SIZE}`} variant="ghost" onPress={() => grantTokens(SPIN_PACK_SIZE, 'purchase_stub')} disabled={committing} />
          </View>
          <Text style={styles.stubText}>{SPIN_PACK_PRICE_LABEL} is a stub until the trusted payment backend verifies receipts.</Text>
        </View>
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
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  content: {
    paddingBottom: S.x7,
    gap: S.lg,
  },
  metrics: {
    flexDirection: 'row',
    gap: S.md,
    paddingHorizontal: S.lg,
    paddingTop: S.lg,
  },
  metricCard: {
    flex: 1,
    minHeight: 92,
    borderRadius: R.md,
    borderWidth: S.px,
    borderColor: Colors.stroke,
    backgroundColor: Colors.bgSurface,
    padding: S.lg,
    justifyContent: 'space-between',
  },
  metricValue: {
    color: Colors.textPrimary,
    fontFamily: F.family.displayBold,
    fontSize: F.size.x2,
  },
  metricLabel: {
    color: Colors.textTertiary,
    fontFamily: F.family.monoMedium,
    fontSize: F.size.xs,
    textTransform: 'uppercase',
  },
  progressCard: {
    marginHorizontal: S.lg,
    borderRadius: R.md,
    borderWidth: S.px,
    borderColor: Colors.stroke,
    backgroundColor: Colors.bgSurface,
    padding: S.lg,
    gap: S.md,
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    color: Colors.textPrimary,
    fontFamily: F.family.bodySemi,
    fontSize: F.size.base,
  },
  progressText: {
    color: Colors.accentVolt,
    fontFamily: F.family.monoBold,
    fontSize: F.size.sm,
  },
  reelBlock: {
    gap: S.md,
  },
  reelHeader: {
    paddingHorizontal: S.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: S.md,
  },
  reelMeta: {
    color: Colors.textTertiary,
    fontFamily: F.family.monoMedium,
    fontSize: F.size.xs,
  },
  actions: {
    paddingHorizontal: S.lg,
    gap: S.md,
  },
  secondaryActions: {
    flexDirection: 'row',
    gap: S.sm,
  },
  stubText: {
    color: Colors.textMuted,
    fontFamily: F.family.bodyRegular,
    fontSize: F.size.xs,
    lineHeight: F.size.xs * F.lineHeight.normal,
  },
});
