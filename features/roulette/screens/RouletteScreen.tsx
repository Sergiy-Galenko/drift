import { useCallback, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { LocalizedText as Text } from '@/components/ui/LocalizedText';
import { useRouter } from 'expo-router';

import { BoxIcon, GridIcon, MarketIcon } from '@/components/icons';
import { Header } from '@/components/navigation/Header';
import { DossierSkeleton } from '@/components/dossier/DossierSkeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { IconButton } from '@/components/ui/IconButton';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Colors, F, R, S } from '@/constants/tokens';
import { useHaptics } from '@/hooks/useHaptics';

import { CardRevealModal } from '../components/CardRevealModal';
import { RouletteWheel } from '../components/RouletteWheel';
import { getCardsByIds, MAIN_ROULETTE_CARD_IDS } from '../config/cardsData';
import { ROULETTE_SPIN_COST } from '../config/rouletteConfig';
import { hasClaimedDailyActivity } from '../services/rouletteService';
import {
  getRouletteProgress,
  useRouletteStore,
} from '../store/useRouletteStore';
import type { SpinResult } from '../types/roulette.types';

export function RouletteScreen() {
  const router = useRouter();
  const haptics = useHaptics();
  const userState = useRouletteStore((state) => state.userState);
  const loading = useRouletteStore((state) => state.loading);
  const error = useRouletteStore((state) => state.error);
  const committing = useRouletteStore((state) => state.committing);
  const spin = useRouletteStore((state) => state.spin);
  const grantTokens = useRouletteStore((state) => state.grantTokens);
  const [spinNonce, setSpinNonce] = useState(0);
  const [wheelResult, setWheelResult] = useState<SpinResult | null>(null);
  const [revealResult, setRevealResult] = useState<SpinResult | null>(null);
  const [wheelSpinning, setWheelSpinning] = useState(false);
  const cards = useMemo(() => getCardsByIds(MAIN_ROULETTE_CARD_IDS), []);
  const progress = getRouletteProgress(userState);
  const canClaimDailyToken = !hasClaimedDailyActivity(userState);
  const spinDisabled = !userState || userState.spinTokens < ROULETTE_SPIN_COST || wheelSpinning || committing;

  const startSpin = useCallback(async () => {
    void haptics.selection();
    setWheelSpinning(true);
    const result = await spin();

    if (!result) {
      setWheelSpinning(false);
      return;
    }

    setRevealResult(null);
    setWheelResult(result);
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

  if (loading) {
    return <View style={styles.root}><Header title="OPEN THE ENVELOPE" showBack /><DossierSkeleton rows={3} /></View>;
  }

  if (error) {
    return <View style={styles.root}><Header title="OPEN THE ENVELOPE" showBack /><ErrorState title="Envelope unavailable" message="The reward file could not be opened." /></View>;
  }

  return (
    <View style={styles.root}>
      <Header
        title="OPEN THE ENVELOPE"
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
            <Text style={styles.metricLabel} translate>Spin tokens</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>{progress.collected}/{progress.total}</Text>
            <Text style={styles.metricLabel} translate>Collected</Text>
          </View>
        </View>

        <View style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <Text style={styles.sectionTitle} translate>Collection progress</Text>
            <Text style={styles.progressText}>{Math.round(progress.progress * 100)}%</Text>
          </View>
          <ProgressBar progress={progress.progress} tone="volt" />
        </View>

        <View style={styles.reelBlock}>
          <View style={styles.reelHeader}>
            <Text style={styles.sectionTitle} translate>Main pool</Text>
            <Text style={styles.reelMeta} translate>70 / 25 / 5 weighted rarity</Text>
          </View>
          <RouletteWheel cards={cards} resultCard={wheelResult?.card ?? null} spinNonce={spinNonce} onSettled={onWheelSettled} />
        </View>

        <View style={styles.actions}>
          <Button
            label={`Spin - ${ROULETTE_SPIN_COST} token`}
            onPress={() => void startSpin()}
            disabled={spinDisabled}
            loading={wheelSpinning || committing}
          />
          <View style={styles.secondaryActions}>
            <Button
              label="Claim +1 activity"
              variant="secondary"
              onPress={() => grantTokens(1, 'daily_activity')}
              disabled={committing || !canClaimDailyToken}
            />
          </View>
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
    borderColor: Colors.paperLine,
    backgroundColor: Colors.dossier,
    padding: S.lg,
    justifyContent: 'space-between',
  },
  metricValue: {
    color: Colors.ink,
    fontFamily: F.family.displayBold,
    fontSize: F.size.x2,
  },
  metricLabel: {
    color: Colors.slate,
    fontFamily: F.family.monoMedium,
    fontSize: F.size.xs,
    textTransform: 'uppercase',
  },
  progressCard: {
    marginHorizontal: S.lg,
    borderRadius: R.md,
    borderWidth: S.px,
    borderColor: Colors.paperLine,
    backgroundColor: Colors.dossier,
    padding: S.lg,
    gap: S.md,
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    color: Colors.ink,
    fontFamily: F.family.bodySemi,
    fontSize: F.size.base,
  },
  progressText: {
    color: Colors.ledger,
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
    color: Colors.slate,
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
});
