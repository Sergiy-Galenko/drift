import { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
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
    <Animated.View style={[animatedStyle, item.isUnlocked && !item.isOpened ? styles.readyGlow : null]}>
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
        <LinearGradient colors={item.design.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.caseArt}>
          <View style={[styles.caseStripe, { backgroundColor: `${item.design.accent}44`, transform: [{ rotate: `${item.design.patternAngle}deg` }] }]} />
          <View style={[styles.caseGlyphWrap, { borderColor: item.design.accent }]}>
            {item.isUnlocked ? (
              <>
                <BoxIcon size={22} color={item.isOpened ? Colors.textTertiary : item.design.accent} />
                <Text style={[styles.caseGlyph, { color: item.design.accent }]}>{item.design.glyph}</Text>
              </>
            ) : (
              <LockIcon size={26} color={Colors.textTertiary} />
            )}
          </View>
        </LinearGradient>
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
    backgroundColor: Colors.bgSurface,
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
  readyGlow: {
    shadowColor: Colors.accentVolt,
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 5,
  },
  caseArt: {
    width: 72,
    minHeight: 96,
    borderRadius: R.md,
    borderWidth: S.px,
    borderColor: Colors.strokeStrong,
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
    backgroundColor: 'rgba(0,0,0,0.36)',
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
    color: Colors.textPrimary,
    fontFamily: F.family.displayBold,
    fontSize: F.size.lg,
  },
  description: {
    color: Colors.textSecondary,
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
