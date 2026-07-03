import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { BoxIcon, GridIcon, MarketIcon, RouletteIcon } from '@/components/icons';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Colors, F, R, S } from '@/constants/tokens';
import { useAuthStore } from '@/stores/authStore';

import { getRouletteProgress, useRouletteStore, useRouletteSync } from '../store/useRouletteStore';

export function RouletteEntryCard() {
  const router = useRouter();
  const profile = useAuthStore((state) => state.profile);
  useRouletteSync(profile);
  const userState = useRouletteStore((state) => state.userState);
  const progress = getRouletteProgress(userState);

  return (
    <View style={styles.wrap}>
      <Pressable onPress={() => router.push('/(roulette)')} style={({ pressed }) => [styles.card, pressed ? styles.pressed : null]}>
        <View style={styles.iconWrap}>
          <RouletteIcon size={26} color={Colors.black} />
        </View>
        <View style={styles.body}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>Roulette</Text>
            <Text style={styles.tokens}>{userState?.spinTokens ?? 0} spins</Text>
          </View>
          <Text style={styles.copy}>Collect commitment cards, unlock cases, and track duplicate pulls.</Text>
          <View style={styles.progressBlock}>
            <ProgressBar progress={progress.progress} tone="volt" />
            <Text style={styles.progressText}>{progress.collected} / {progress.total} cards collected</Text>
          </View>
        </View>
      </Pressable>
      <View style={styles.actions}>
        <Pressable onPress={() => router.push('/(roulette)/collection')} style={styles.action}>
          <GridIcon size={18} color={Colors.textPrimary} />
          <Text style={styles.actionText}>Collection</Text>
        </Pressable>
        <Pressable onPress={() => router.push('/(roulette)/cases')} style={styles.action}>
          <BoxIcon size={18} color={Colors.textPrimary} />
          <Text style={styles.actionText}>Cases</Text>
        </Pressable>
        <Pressable onPress={() => router.push('/(roulette)/market')} style={styles.action}>
          <MarketIcon size={18} color={Colors.textPrimary} />
          <Text style={styles.actionText}>Market</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: S.sm,
    paddingHorizontal: S.lg,
  },
  card: {
    flexDirection: 'row',
    gap: S.md,
    borderRadius: R.md,
    borderWidth: S.px,
    borderColor: Colors.strokeStrong,
    backgroundColor: Colors.bgSurface,
    padding: S.lg,
  },
  pressed: {
    opacity: 0.84,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: R.pill,
    backgroundColor: Colors.accentVolt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    flex: 1,
    gap: S.sm,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: S.sm,
  },
  title: {
    color: Colors.textPrimary,
    fontFamily: F.family.displayBold,
    fontSize: F.size.lg,
  },
  tokens: {
    color: Colors.accentVolt,
    fontFamily: F.family.monoBold,
    fontSize: F.size.sm,
  },
  copy: {
    color: Colors.textSecondary,
    fontFamily: F.family.bodyRegular,
    fontSize: F.size.sm,
    lineHeight: F.size.sm * F.lineHeight.normal,
  },
  progressBlock: {
    gap: S.xs,
  },
  progressText: {
    color: Colors.textTertiary,
    fontFamily: F.family.monoMedium,
    fontSize: F.size.xs,
  },
  actions: {
    flexDirection: 'row',
    gap: S.sm,
  },
  action: {
    flex: 1,
    height: 42,
    borderRadius: R.sm,
    borderWidth: S.px,
    borderColor: Colors.stroke,
    backgroundColor: Colors.bgSurface,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: S.sm,
  },
  actionText: {
    color: Colors.textPrimary,
    fontFamily: F.family.bodySemi,
    fontSize: F.size.sm,
  },
});
