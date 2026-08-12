import { StyleSheet, Text, View } from 'react-native';

import { Header } from '@/components/navigation/Header';
import { DossierSkeleton } from '@/components/dossier/DossierSkeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Colors, F, R, S } from '@/constants/tokens';

import { CollectionGrid } from '../components/CollectionGrid';
import { getRouletteProgress, useRouletteStore } from '../store/useRouletteStore';

export function CollectionScreen() {
  const userState = useRouletteStore((state) => state.userState);
  const loading = useRouletteStore((state) => state.loading);
  const error = useRouletteStore((state) => state.error);
  const toggleShowcaseCard = useRouletteStore((state) => state.toggleShowcaseCard);
  const progress = getRouletteProgress(userState);

  if (loading && !userState) {
    return <View style={styles.root}><Header title="VAULT / CASE ARCHIVE" showBack /><DossierSkeleton rows={4} /></View>;
  }

  if (error && !userState) {
    return <View style={styles.root}><Header title="VAULT / CASE ARCHIVE" showBack /><ErrorState title="Vault unavailable" message="The archive could not be opened." /></View>;
  }

  return (
    <View style={styles.root}>
      <Header title="VAULT / CASE ARCHIVE" showBack />
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
    borderColor: Colors.paperLine,
    backgroundColor: Colors.dossier,
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
    color: Colors.ink,
    fontFamily: F.family.bodySemi,
    fontSize: F.size.base,
  },
  tokens: {
    color: Colors.ledger,
    fontFamily: F.family.monoBold,
    fontSize: F.size.sm,
  },
});
