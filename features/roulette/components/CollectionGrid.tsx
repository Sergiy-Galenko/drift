import { FlatList, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';

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
    <FlatList
      data={ROULETTE_CARDS}
      keyExtractor={(item) => item.id}
      numColumns={2}
      columnWrapperStyle={styles.row}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      renderItem={({ item }) => {
        const entry = state?.cards[item.id];
        const unlocked = Boolean(entry);
        const isShowcased = showcaseCardIds.includes(item.id);

        return (
          <View style={[styles.item, { width: itemWidth }, borderStyle(item, unlocked), item.rarity === 'ultra_rare' && unlocked ? styles.ultraGlow : null]}>
            <CardArtwork card={item} locked={!unlocked} compact />
            <View style={styles.meta}>
              <Text numberOfLines={1} style={[styles.name, !unlocked ? styles.lockedText : null]}>{unlocked ? item.name : 'Locked'}</Text>
              {unlocked ? (
                <View style={styles.badgeRow}>
                  <Badge label={RARITY_LABELS[item.rarity]} tone={RARITY_BADGE_TONES[item.rarity]} />
                  {entry && entry.count > 1 ? <Text style={styles.duplicate}>x{entry.count}</Text> : null}
                </View>
              ) : (
                <Text style={styles.hint}>Reveal through roulette or cases</Text>
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
  row: {
    gap: S.md,
  },
  item: {
    minHeight: 248,
    borderRadius: R.md,
    borderWidth: S.px,
    backgroundColor: Colors.bgSurface,
    padding: S.md,
    gap: S.md,
    marginBottom: S.md,
  },
  commonBorder: {
    borderColor: Colors.strokeStrong,
  },
  rareBorder: {
    borderColor: Colors.accentIce,
  },
  ultraBorder: {
    borderColor: Colors.accentAmber,
  },
  ultraGlow: {
    shadowColor: Colors.accentAmber,
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 6,
  },
  lockedBorder: {
    borderColor: Colors.stroke,
    backgroundColor: Colors.surface,
  },
  meta: {
    gap: S.sm,
  },
  name: {
    color: Colors.textPrimary,
    fontFamily: F.family.bodySemi,
    fontSize: F.size.base,
  },
  lockedText: {
    color: Colors.textTertiary,
  },
  hint: {
    color: Colors.textMuted,
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
    color: Colors.textPrimary,
    fontFamily: F.family.monoBold,
    fontSize: F.size.sm,
  },
  showcaseButton: {
    minHeight: 34,
    borderRadius: R.sm,
    borderWidth: S.px,
    borderColor: Colors.strokeStrong,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: S.sm,
  },
  showcaseActive: {
    borderColor: Colors.accentVolt,
    backgroundColor: 'rgba(202,255,0,0.10)',
  },
  showcaseText: {
    color: Colors.textSecondary,
    fontFamily: F.family.bodySemi,
    fontSize: F.size.xs,
    textAlign: 'center',
  },
  showcaseTextActive: {
    color: Colors.accentVolt,
  },
});
