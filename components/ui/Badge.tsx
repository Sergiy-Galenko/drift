import { StyleSheet, Text, View } from 'react-native';

import { Colors, F, R, S } from '@/constants/tokens';

type BadgeTone = 'volt' | 'fire' | 'ice' | 'amber' | 'neutral';

type BadgeProps = {
  label: string;
  tone?: BadgeTone;
};

export function Badge({ label, tone = 'neutral' }: BadgeProps) {
  return (
    <View style={[styles.badge, styles[tone]]}>
      <Text style={[styles.label, tone === 'volt' ? styles.darkLabel : styles.lightLabel]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    borderRadius: R.pill,
    borderWidth: S.px,
    paddingHorizontal: S.md,
    paddingVertical: S.xs,
  },
  volt: {
    backgroundColor: Colors.accentVolt,
    borderColor: Colors.accentVolt,
  },
  fire: {
    backgroundColor: Colors.bgSurface,
    borderColor: Colors.accentFire,
  },
  ice: {
    backgroundColor: Colors.bgSurface,
    borderColor: Colors.accentIce,
  },
  amber: {
    backgroundColor: Colors.bgSurface,
    borderColor: Colors.accentAmber,
  },
  neutral: {
    backgroundColor: Colors.bgSurface,
    borderColor: Colors.strokeStrong,
  },
  label: {
    fontFamily: F.family.monoBold,
    fontSize: F.size.xs,
    textTransform: 'uppercase',
  },
  darkLabel: {
    color: Colors.bgBase,
  },
  lightLabel: {
    color: Colors.textPrimary,
  },
});
