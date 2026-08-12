import { useEffect } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { LocalizedText as Text } from '@/components/ui/LocalizedText';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';

import { InkStamp } from '@/components/dossier/InkStamp';
import { FoilSeal } from '@/components/dossier/FoilSeal';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Colors, F, R, S } from '@/constants/tokens';

import { CardArtwork } from './CardArtwork';
import { RARITY_BADGE_TONES, RARITY_LABELS } from '../config/rouletteConfig';
import type { Card } from '../types/roulette.types';

type CardRevealModalProps = {
  visible: boolean;
  card: Card | null;
  isDuplicate: boolean;
  duplicateCount: number;
  onClose: () => void;
};

export function CardRevealModal({ visible, card, isDuplicate, duplicateCount, onClose }: CardRevealModalProps) {
  const scale = useSharedValue(0.84);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      opacity.value = withTiming(1, { duration: 180 });
      scale.value = withSpring(1, { damping: 18, stiffness: 210 });
    } else {
      opacity.value = withTiming(0, { duration: 120 });
      scale.value = 0.84;
    }
  }, [opacity, scale, visible]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  if (!card) {
    return null;
  }

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable
          style={StyleSheet.absoluteFill}
          accessibilityRole="button"
          accessibilityLabel="Close"
          onPress={onClose}
        />
        <Animated.View style={[styles.card, card.rarity === 'ultra_rare' ? styles.ultraCard : null, animatedStyle]}>
          <View>
            <View style={styles.seal}>
              <FoilSeal rare={card.rarity === 'ultra_rare'} />
              <InkStamp label="SEAL BROKEN" tone={card.rarity === 'ultra_rare' ? 'gold' : card.rarity === 'rare' ? 'blue' : 'neutral'} />
            </View>
            <CardArtwork card={card} />
            <View style={styles.body}>
              <View style={styles.titleRow}>
                <Text numberOfLines={2} style={styles.title}>{card.name}</Text>
                <Badge label={RARITY_LABELS[card.rarity]} tone={RARITY_BADGE_TONES[card.rarity]} />
              </View>
              <Text style={styles.description}>{card.description}</Text>
              {isDuplicate ? <Text style={styles.duplicate}>DUPLICATE / SHRED FOR INK x{duplicateCount}</Text> : <Text style={styles.newCard} translate>FILED IN THE VAULT</Text>}
              <Button label="Close" variant="secondary" onPress={onClose} />
            </View>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: Colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
    padding: S.x2,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    borderRadius: R.lg,
    borderWidth: S.px,
    borderColor: Colors.paperLine,
    backgroundColor: Colors.dossier,
    overflow: 'hidden',
  },
  ultraCard: {
    borderColor: Colors.goldFoil,
  },
  body: {
    padding: S.lg,
    gap: S.md,
  },
  titleRow: {
    gap: S.sm,
  },
  title: {
    color: Colors.ink,
    fontFamily: F.family.displayBold,
    fontSize: F.size.xl,
  },
  description: {
    color: Colors.slate,
    fontFamily: F.family.bodyRegular,
    fontSize: F.size.base,
    lineHeight: F.size.base * F.lineHeight.normal,
  },
  duplicate: {
    color: Colors.oxblood,
    fontFamily: F.family.monoBold,
    fontSize: F.size.sm,
    textTransform: 'uppercase',
  },
  newCard: {
    color: Colors.ledger,
    fontFamily: F.family.monoBold,
    fontSize: F.size.sm,
    textTransform: 'uppercase',
  },
  seal: {
    alignItems: 'center',
    gap: S.xs,
    paddingTop: S.lg,
  },
});
