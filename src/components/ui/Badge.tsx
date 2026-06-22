import { StyleSheet, Text, View } from 'react-native';

import { colors } from '@/constants/colors';
import { fontFamily, radius } from '@/constants/typography';

type BadgeTone = 'neutral' | 'volt' | 'fire' | 'ice';

type BadgeProps = {
  label: string;
  tone?: BadgeTone;
};

function toneColor(tone: BadgeTone): string {
  switch (tone) {
    case 'volt':
      return colors.volt;
    case 'fire':
      return colors.fire;
    case 'ice':
      return colors.ice;
    case 'neutral':
    default:
      return colors.textMuted;
  }
}

export function Badge({ label, tone = 'neutral' }: BadgeProps) {
  const color = toneColor(tone);

  return (
    <View style={[styles.badge, { borderColor: color }]}>
      <Text style={[styles.label, { color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderWidth: 1,
    borderRadius: radius.sm,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: colors.surface,
  },
  label: {
    fontFamily: fontFamily.monoBold,
    fontSize: 10,
    letterSpacing: 0,
  },
});
