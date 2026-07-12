import { StyleSheet, Text, View } from 'react-native';

import { Header } from '@/components/navigation/Header';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Colors, F, R, S } from '@/constants/tokens';

import { CollectionGrid } from '../components/CollectionGrid';
import { getRouletteProgress, useRouletteStore } from '../store/useRouletteStore';

export function CollectionScreen() {
  const userState = useRouletteStore((state) => state.userState);
  const toggleShowcaseCard = useRouletteStore((state) => state.toggleShowcaseCard);
  const progress = getRouletteProgress(userState);

  return (
    <View style={styles.root}>
      <Header title="My collection" showBack />
      <View style={styles.summary}>
        <View style={styles.summaryHeader}>
          <Text style={styles.title}>{progress.collected} / {progress.total} cards collected</Text>
          <Text style={styles.tokens}>{userState?.spinTokens ?? 0} spins</Text>
        </View>
        <ProgressBar progress={progress.progress} tone="ice" />
      </View>
      <CollectionGrid
        state={userState}
        showcaseCardIds={userState?.showcaseCardIds ?? []}
        onToggleShowcase={toggleShowcaseCard}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.bgBase,
  },
  summary: {
    margin: S.lg,
    marginBottom: 0,
    borderRadius: R.md,
    borderWidth: S.px,
    borderColor: Colors.stroke,
    backgroundColor: Colors.bgSurface,
    padding: S.lg,
    gap: S.md,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: S.md,
  },
  title: {
    flex: 1,
    color: Colors.textPrimary,
    fontFamily: F.family.bodySemi,
    fontSize: F.size.base,
  },
  tokens: {
    color: Colors.accentVolt,
    fontFamily: F.family.monoBold,
    fontSize: F.size.sm,
  },
});
