import { Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';
import { LocalizedText as Text } from '@/components/ui/LocalizedText';
import { FlashList } from '@shopify/flash-list';

import { Badge } from '@/components/ui/Badge';
import { Colors, F, R, S } from '@/constants/tokens';

import { CardArtwork } from './CardArtwork';
import { ROULETTE_CARDS } from '../config/cardsData';
import { RARITY_BADGE_TONES, RARITY_LABELS } from '../config/rouletteConfig';
import type { Card, RouletteUserState } from '../types/roulette.types';

type CollectionGridProps = {
  state: RouletteUserState | null;
  showcaseCardIds?: string[];
  onToggleShowcase?: (cardId: string) => void;
};

function borderStyle(card: Card, unlocked: boolean) {
  if (!unlocked) {
    return styles.lockedBorder;
  }

  switch (card.rarity) {
    case 'rare':
      return styles.rareBorder;
    case 'ultra_rare':
    return styles.ultraBorder;
    case 'common':
      return styles.commonBorder;
  }
}

export function CollectionGrid({ state, showcaseCardIds = [], onToggleShowcase }: CollectionGridProps) {
  const { width } = useWindowDimensions();
  const itemWidth = Math.floor((width - S.lg * 2 - S.md) / 2);

  return (
    <FlashList
      data={ROULETTE_CARDS}
      keyExtractor={(item) => item.id}
      numColumns={2}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      renderItem={({ item, index }) => {
        const entry = state?.cards[item.id];
        const unlocked = Boolean(entry);
        const isShowcased = showcaseCardIds.includes(item.id);

        return (
          <View style={[styles.item, { width: itemWidth }, index % 2 === 0 ? styles.leftItem : null, borderStyle(item, unlocked)]}>
            <CardArtwork card={item} locked={!unlocked} compact />
            <View style={styles.meta}>
              <Text numberOfLines={1} style={[styles.name, !unlocked ? styles.lockedText : null]}>{unlocked ? item.name : 'Locked'}</Text>
              {unlocked ? (
                <View style={styles.badgeRow}>
                  <Badge label={RARITY_LABELS[item.rarity]} tone={RARITY_BADGE_TONES[item.rarity]} />
                  {entry && entry.count > 1 ? <Text style={styles.duplicate}>x{entry.count}</Text> : null}
                </View>
              ) : (
                <Text style={styles.hint} translate>Reveal through roulette or cases</Text>
              )}
              {unlocked && onToggleShowcase ? (
                <Pressable onPress={() => onToggleShowcase(item.id)} style={[styles.showcaseButton, isShowcased ? styles.showcaseActive : null]}>
                  <Text style={[styles.showcaseText, isShowcased ? styles.showcaseTextActive : null]}>
                    {isShowcased ? 'Shown on profile' : 'Show on profile'}
                  </Text>
                </Pressable>
              ) : null}
            </View>
          </View>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  content: {
    padding: S.lg,
    paddingBottom: S.x7,
    gap: S.md,
  },
  item: {
    minHeight: 248,
    borderRadius: R.md,
    borderWidth: S.px,
    backgroundColor: Colors.dossier,
    padding: S.md,
    gap: S.md,
    marginBottom: S.md,
  },
  leftItem: {
    marginRight: S.md,
  },
  commonBorder: {
    borderColor: Colors.strokeStrong,
  },
  rareBorder: {
    borderColor: Colors.blueInk,
  },
  ultraBorder: {
    borderColor: Colors.goldFoil,
  },
  lockedBorder: {
    borderColor: Colors.stroke,
    backgroundColor: Colors.surface,
  },
  meta: {
    gap: S.sm,
  },
  name: {
    color: Colors.ink,
    fontFamily: F.family.bodySemi,
    fontSize: F.size.base,
  },
  lockedText: {
    color: Colors.slate,
  },
  hint: {
    color: Colors.slate,
    fontFamily: F.family.bodyRegular,
    fontSize: F.size.xs,
    lineHeight: F.size.xs * F.lineHeight.normal,
  },
  badgeRow: {
    minHeight: 26,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: S.sm,
  },
  duplicate: {
    color: Colors.ink,
    fontFamily: F.family.monoBold,
    fontSize: F.size.sm,
  },
  showcaseButton: {
    minHeight: 34,
    borderRadius: R.sm,
    borderWidth: S.px,
    borderColor: Colors.paperLine,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: S.sm,
  },
  showcaseActive: {
    borderColor: Colors.ledger,
    backgroundColor: Colors.dossier,
  },
  showcaseText: {
    color: Colors.slate,
    fontFamily: F.family.bodySemi,
    fontSize: F.size.xs,
    textAlign: 'center',
  },
  showcaseTextActive: {
    color: Colors.ledger,
  },
});
