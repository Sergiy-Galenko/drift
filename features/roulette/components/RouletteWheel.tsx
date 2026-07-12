import { useCallback, useEffect, useMemo, useState } from 'react';
import { type LayoutChangeEvent, StyleSheet, Text, View } from 'react-native';
import Animated, { Easing, runOnJS, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { Colors, F, R, S } from '@/constants/tokens';

import { CardArtwork } from './CardArtwork';
import type { Card } from '../types/roulette.types';

type RouletteWheelProps = {
  cards: Card[];
  resultCard: Card | null;
  spinNonce: number;
  onSettled: () => void;
};

const CELL_WIDTH = 112;
const CELL_GAP = 12;
const RESULT_INDEX = 8;
const REEL_PADDING_LEFT = S.x2;
const INDICATOR_WIDTH = 3;

function buildIdleReel(cards: Card[]): Card[] {
  return cards.slice(0, 8);
}

function buildSpinReel(cards: Card[], resultCard: Card, seed: number): Card[] {
  const reel = Array.from({ length: 12 }, (_, index) => cards[(index + seed) % cards.length]);
  reel[RESULT_INDEX] = resultCard;
  return reel;
}

export function RouletteWheel({ cards, resultCard, spinNonce, onSettled }: RouletteWheelProps) {
  const translateX = useSharedValue(0);
  const [reelCards, setReelCards] = useState<Card[]>(() => buildIdleReel(cards));
  const [viewportWidth, setViewportWidth] = useState(0);
  const targetOffset = useMemo(() => {
    const resultCenter = REEL_PADDING_LEFT + RESULT_INDEX * (CELL_WIDTH + CELL_GAP) + CELL_WIDTH / 2;
    return viewportWidth / 2 - resultCenter;
  }, [viewportWidth]);

  const handleLayout = useCallback((event: LayoutChangeEvent) => {
    const { width } = event.nativeEvent.layout;
    setViewportWidth((currentWidth) => (currentWidth === width ? currentWidth : width));
  }, []);

  useEffect(() => {
    if (!resultCard || cards.length === 0 || spinNonce === 0 || viewportWidth === 0) {
      return;
    }

    setReelCards(buildSpinReel(cards, resultCard, spinNonce));
    translateX.value = 0;
    translateX.value = withTiming(
      targetOffset,
      { duration: 2600, easing: Easing.out(Easing.cubic) },
      (finished) => {
        if (finished) {
          runOnJS(onSettled)();
        }
      },
    );
  }, [cards, onSettled, resultCard, spinNonce, targetOffset, translateX, viewportWidth]);

  useEffect(() => {
    if (spinNonce === 0) {
      setReelCards(buildIdleReel(cards));
    }
  }, [cards, spinNonce]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const reelWidth = useMemo(
    () => REEL_PADDING_LEFT + reelCards.length * CELL_WIDTH + Math.max(0, reelCards.length - 1) * CELL_GAP,
    [reelCards.length],
  );

  return (
    <View style={styles.wrap} onLayout={handleLayout}>
      <View pointerEvents="none" style={styles.indicator}>
        <View style={styles.indicatorLine} />
      </View>
      <Animated.View style={[styles.reel, { width: reelWidth }, animatedStyle]}>
        {reelCards.map((card, index) => (
          <View key={`${card.id}-${index}`} style={styles.cell}>
            <CardArtwork card={card} compact />
            <Text numberOfLines={1} style={styles.cardName}>{card.name}</Text>
          </View>
        ))}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    height: 196,
    overflow: 'hidden',
    borderTopWidth: S.px,
    borderBottomWidth: S.px,
    borderColor: Colors.stroke,
    backgroundColor: Colors.bgSurface,
    justifyContent: 'center',
  },
  reel: {
    flexDirection: 'row',
    gap: CELL_GAP,
    paddingLeft: REEL_PADDING_LEFT,
    alignItems: 'center',
  },
  cell: {
    width: CELL_WIDTH,
    gap: S.sm,
  },
  cardName: {
    color: Colors.textSecondary,
    fontFamily: F.family.bodySemi,
    fontSize: F.size.xs,
    textAlign: 'center',
  },
  indicator: {
    position: 'absolute',
    top: S.md,
    bottom: S.md,
    left: '50%',
    zIndex: 2,
    alignItems: 'center',
  },
  indicatorLine: {
    width: INDICATOR_WIDTH,
    height: '100%',
    borderRadius: R.pill,
    backgroundColor: Colors.white,
    opacity: 0.86,
    marginLeft: -INDICATOR_WIDTH / 2,
  },
});
