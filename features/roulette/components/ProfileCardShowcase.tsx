import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { MarketIcon } from '@/components/icons';
import { Colors, F, R, S } from '@/constants/tokens';
import { useAuthStore } from '@/stores/authStore';

import { CardArtwork } from './CardArtwork';
import { RARITY_LABELS } from '../config/rouletteConfig';
import {
  getProfileShowcaseCards,
  useRouletteStore,
  useRouletteSync,
} from '../store/useRouletteStore';

export function ProfileCardShowcase() {
  const router = useRouter();
  const profile = useAuthStore((state) => state.profile);
  useRouletteSync(profile);
  const userState = useRouletteStore((state) => state.userState);
  const cards = getProfileShowcaseCards(userState);

  if (cards.length === 0) {
    return null;
  }

  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <Text style={styles.title}>Profile cards</Text>
        <Pressable onPress={() => router.push('/(roulette)/collection')} style={styles.link}>
          <MarketIcon size={16} color={Colors.accentVolt} />
          <Text style={styles.linkText}>Manage</Text>
        </Pressable>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.cards}>
        {cards.map((card) => (
          <View key={card.id} style={styles.card}>
            <CardArtwork card={card} compact />
            <Text numberOfLines={1} style={styles.cardName}>{card.name}</Text>
            <Text style={styles.rarity}>{RARITY_LABELS[card.rarity]}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: S.md,
    paddingBottom: S.lg,
  },
  header: {
    paddingHorizontal: S.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: S.md,
  },
  title: {
    color: Colors.textPrimary,
    fontFamily: F.family.bodySemi,
    fontSize: F.size.base,
  },
  link: {
    minHeight: 32,
    flexDirection: 'row',
    alignItems: 'center',
    gap: S.xs,
    borderRadius: R.pill,
    borderWidth: S.px,
    borderColor: Colors.strokeStrong,
    paddingHorizontal: S.md,
  },
  linkText: {
    color: Colors.accentVolt,
    fontFamily: F.family.bodySemi,
    fontSize: F.size.xs,
  },
  cards: {
    paddingHorizontal: S.lg,
    gap: S.md,
  },
  card: {
    width: 116,
    gap: S.sm,
    borderRadius: R.md,
    borderWidth: S.px,
    borderColor: Colors.stroke,
    backgroundColor: Colors.bgSurface,
    padding: S.sm,
  },
  cardName: {
    color: Colors.textPrimary,
    fontFamily: F.family.bodySemi,
    fontSize: F.size.sm,
  },
  rarity: {
    color: Colors.textTertiary,
    fontFamily: F.family.monoMedium,
    fontSize: F.size.xs,
    textTransform: 'uppercase',
  },
});
