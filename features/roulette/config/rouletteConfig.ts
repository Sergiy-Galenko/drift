import type { Card, CardRarity } from '../types/roulette.types';

export const ROULETTE_INITIAL_SPIN_TOKENS = 3;
export const ROULETTE_SPIN_COST = 1;
export const SPIN_PACK_SIZE = 5;
export const SPIN_PACK_PRICE_LABEL = 'IAP pack';
export const PROFILE_SHOWCASE_LIMIT = 3;

export const RARITY_WEIGHTS: Record<CardRarity, number> = {
  common: 70,
  rare: 25,
  ultra_rare: 5,
};

export const RARITY_LABELS: Record<CardRarity, string> = {
  common: 'Common',
  rare: 'Rare',
  ultra_rare: 'Ultra Rare',
};

export const RARITY_BADGE_TONES: Record<CardRarity, 'neutral' | 'ice' | 'amber'> = {
  common: 'neutral',
  rare: 'ice',
  ultra_rare: 'amber',
};

export const CARD_TOTAL = 25;

export const CARD_MARKET_VALUES: Record<CardRarity, number> = {
  common: 1,
  rare: 3,
  ultra_rare: 8,
};

export const RARITY_ORDER: Record<CardRarity, number> = {
  common: 1,
  rare: 2,
  ultra_rare: 3,
};

function groupedByRarity(cards: Card[]): Record<CardRarity, Card[]> {
  const groups: Record<CardRarity, Card[]> = { common: [], rare: [], ultra_rare: [] };

  for (const card of cards) {
    groups[card.rarity] = [...groups[card.rarity], card];
  }

  return groups;
}

export function getWeightedCardEntries(cards: Card[]): { card: Card; weight: number }[] {
  const groups = groupedByRarity(cards);

  return cards.map((card) => {
    const rarityPoolSize = Math.max(groups[card.rarity].length, 1);
    const rarityWeight = RARITY_WEIGHTS[card.rarity] ?? 0;

    return {
      card,
      weight: rarityWeight / rarityPoolSize,
    };
  });
}

export function pickWeightedCard(cards: Card[], random = Math.random): Card {
  if (cards.length === 0) {
    throw new Error('roulette-empty-pool');
  }

  const entries = getWeightedCardEntries(cards);
  const totalWeight = entries.reduce((sum, entry) => sum + entry.weight, 0);

  if (totalWeight <= 0) {
    // Все веса нулевые/некорректные — выбираем равновероятно, чтобы не всегда
    // возвращать последнюю карту молча.
    const index = Math.floor(random() * entries.length);
    return entries[Math.min(index, entries.length - 1)].card;
  }

  let cursor = random() * totalWeight;

  for (const entry of entries) {
    cursor -= entry.weight;
    if (cursor <= 0) {
      return entry.card;
    }
  }

  return entries[entries.length - 1].card;
}