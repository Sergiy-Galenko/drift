import { useEffect } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { LocalizedText as Text } from '@/components/ui/LocalizedText';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { BoxIcon, LockIcon } from '@/components/icons';
import { Badge } from '@/components/ui/Badge';
import { Colors, F, R, S } from '@/constants/tokens';

import type { RouletteCaseView } from '../types/roulette.types';

type CaseCardProps = {
  item: RouletteCaseView;
  opening: boolean;
  onOpen: (caseId: string) => void;
};

export function CaseCard({ item, opening, onOpen }: CaseCardProps) {
  const rotation = useSharedValue(0);
  const scale = useSharedValue(1);

  useEffect(() => {
    if (!opening) {
      rotation.value = withSpring(0);
      scale.value = withSpring(1);
      return;
    }

    rotation.value = withSequence(
      withTiming(-3, { duration: 90 }),
      withTiming(3, { duration: 90 }),
      withTiming(-2, { duration: 90 }),
      withTiming(2, { duration: 90 }),
      withTiming(0, { duration: 90 }),
    );
    scale.value = withSequence(withSpring(1.04), withSpring(1));
  }, [opening, rotation, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }, { scale: scale.value }],
  }));

  const disabled = !item.canOpen || opening;

  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        accessibilityRole="button"
        disabled={disabled}
        onPress={() => onOpen(item.id)}
        style={({ pressed }) => [
          styles.card,
          !item.isUnlocked ? styles.locked : null,
          item.isOpened ? styles.opened : null,
          pressed && !disabled ? styles.pressed : null,
        ]}
      >
        <View style={[styles.caseArt, { borderColor: item.isUnlocked ? Colors.goldFoil : Colors.slate }]}>
          <View style={[styles.caseStripe, { backgroundColor: item.isUnlocked ? Colors.goldFoil : Colors.slate, transform: [{ rotate: `${item.design.patternAngle}deg` }] }]} />
          <View style={[styles.caseGlyphWrap, { borderColor: item.isUnlocked ? Colors.goldFoil : Colors.slate }]}>
            {item.isUnlocked ? (
              <>
                <BoxIcon size={22} color={item.isOpened ? Colors.slate : Colors.goldFoil} />
                <Text style={[styles.caseGlyph, { color: Colors.goldFoil }]}>{item.design.glyph}</Text>
              </>
            ) : (
              <LockIcon size={26} color={Colors.textTertiary} />
            )}
          </View>
        </View>
        <View style={styles.body}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>{item.title}</Text>
            <Badge label={item.unlockType === 'achievement' ? 'Achievement' : 'Purchase'} tone={item.unlockType === 'achievement' ? 'ice' : 'amber'} />
          </View>
          <Text style={styles.description}>{item.description}</Text>
          <Text style={[styles.status, item.canOpen ? styles.statusReady : null]}>
            {item.isOpened ? 'Opened' : item.isUnlocked ? (item.unlockType === 'purchase' ? item.unlockLabel : 'Ready to open') : item.unlockLabel}
          </Text>
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    gap: S.md,
    borderRadius: R.md,
    borderWidth: S.px,
    borderColor: Colors.strokeStrong,
    backgroundColor: Colors.dossier,
    padding: S.lg,
  },
  locked: {
    borderColor: Colors.stroke,
    backgroundColor: Colors.surface,
  },
  opened: {
    opacity: 0.7,
  },
  pressed: {
    opacity: 0.84,
  },
  caseArt: {
    width: 72,
    minHeight: 96,
    borderRadius: R.md,
    borderWidth: S.px,
    borderColor: Colors.goldFoil,
    backgroundColor: Colors.dossier,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  caseStripe: {
    position: 'absolute',
    width: '150%',
    height: S.sm,
  },
  caseGlyphWrap: {
    width: 52,
    height: 52,
    borderRadius: R.pill,
    borderWidth: S.px,
    backgroundColor: Colors.wall,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 1,
  },
  caseGlyph: {
    fontFamily: F.family.monoBold,
    fontSize: F.size.micro,
    letterSpacing: 0,
  },
  body: {
    flex: 1,
    gap: S.sm,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: S.sm,
  },
  title: {
    flex: 1,
    color: Colors.ink,
    fontFamily: F.family.displayBold,
    fontSize: F.size.lg,
  },
  description: {
    color: Colors.slate,
    fontFamily: F.family.bodyRegular,
    fontSize: F.size.sm,
    lineHeight: F.size.sm * F.lineHeight.normal,
  },
  status: {
    color: Colors.textTertiary,
    fontFamily: F.family.monoBold,
    fontSize: F.size.xs,
    textTransform: 'uppercase',
  },
  statusReady: {
    color: Colors.accentVolt,
  },
});
