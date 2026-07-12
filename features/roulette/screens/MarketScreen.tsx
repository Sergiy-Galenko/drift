import { ScrollView, Pressable, StyleSheet, Text, View } from 'react-native';

import { Header } from '@/components/navigation/Header';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { Colors, F, R, S } from '@/constants/tokens';

import { CardArtwork } from '../components/CardArtwork';
import { ROULETTE_CARD_BY_ID } from '../config/cardsData';
import { RARITY_BADGE_TONES, RARITY_LABELS } from '../config/rouletteConfig';
import { useRouletteStore } from '../store/useRouletteStore';
import type { Card, UserCardEntry } from '../types/roulette.types';

type MarketEntry = {
  entry: UserCardEntry;
  card: Card;
};

export function MarketScreen() {
  const userState = useRouletteStore((state) => state.userState);
  const committing = useRouletteStore((state) => state.committing);
  const sellCard = useRouletteStore((state) => state.sellCard);
  const entries = Object.values(userState?.cards ?? {})
    .map((entry) => ({ entry, card: ROULETTE_CARD_BY_ID[entry.cardId] }))
    .filter((item): item is MarketEntry => Boolean(item.card))
    .sort((left, right) => right.card.marketValue - left.card.marketValue);

  return (
    <View style={styles.root}>
      <Header title="Card market" showBack />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.summary}>
          <Text style={styles.title}>Sell duplicates</Text>
          <Text style={styles.copy}>The market converts extra copies into spin tokens. One copy always stays locked into your collection.</Text>
          <Text style={styles.tokens}>{userState?.spinTokens ?? 0} spin tokens available</Text>
        </View>

        {entries.length === 0 ? (
          <EmptyState title="No cards yet" message="Spin the roulette before listing duplicates on the market." />
        ) : (
          entries.map(({ entry, card }) => {
            const canSell = entry.count > 1 && !committing;

            return (
              <View key={entry.cardId} style={styles.row}>
                <View style={styles.artWrap}>
                  <CardArtwork card={card} compact />
                </View>
                <View style={styles.rowBody}>
                  <View style={styles.titleRow}>
                    <Text numberOfLines={1} style={styles.cardName}>{card.name}</Text>
                    <Badge label={RARITY_LABELS[card.rarity]} tone={RARITY_BADGE_TONES[card.rarity]} />
                  </View>
                  <Text style={styles.meta}>Owned x{entry.count} · market value {card.marketValue} spins</Text>
                  <Pressable
                    accessibilityRole="button"
                    disabled={!canSell}
                    onPress={() => sellCard(entry.cardId)}
                    style={({ pressed }) => [
                      styles.sellButton,
                      canSell ? styles.sellButtonReady : null,
                      pressed && canSell ? styles.pressed : null,
                      !canSell ? styles.disabled : null,
                    ]}
                  >
                    <Text style={[styles.sellText, canSell ? styles.sellTextReady : null]}>
                      {entry.count > 1 ? `Sell duplicate +${card.marketValue}` : 'Duplicate needed'}
                    </Text>
                  </Pressable>
                </View>
              </View>
            );
          })
        )}
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
  row: {
    flexDirection: 'row',
    gap: S.md,
    borderRadius: R.md,
    borderWidth: S.px,
    borderColor: Colors.stroke,
    backgroundColor: Colors.bgSurface,
    padding: S.md,
  },
  artWrap: {
    width: 76,
  },
  rowBody: {
    flex: 1,
    gap: S.sm,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: S.sm,
  },
  cardName: {
    flex: 1,
    color: Colors.textPrimary,
    fontFamily: F.family.bodySemi,
    fontSize: F.size.base,
  },
  meta: {
    color: Colors.textSecondary,
    fontFamily: F.family.bodyRegular,
    fontSize: F.size.sm,
  },
  sellButton: {
    minHeight: 38,
    borderRadius: R.sm,
    borderWidth: S.px,
    borderColor: Colors.strokeStrong,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: S.md,
  },
  sellButtonReady: {
    borderColor: Colors.accentVolt,
    backgroundColor: 'rgba(202,255,0,0.10)',
  },
  pressed: {
    opacity: 0.82,
  },
  disabled: {
    opacity: 0.52,
  },
  sellText: {
    color: Colors.textSecondary,
    fontFamily: F.family.bodySemi,
    fontSize: F.size.sm,
  },
  sellTextReady: {
    color: Colors.accentVolt,
  },
});
