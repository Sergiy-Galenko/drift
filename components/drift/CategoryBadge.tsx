import { StyleSheet, Text, View } from 'react-native';

import { CATEGORIES } from '@/constants/categories';
import { Colors, F, R, S } from '@/constants/tokens';
import type { DriftCategory } from '@/types/drift';

type CategoryBadgeProps = {
  category: DriftCategory;
};

export function CategoryBadge({ category }: CategoryBadgeProps) {
  const config = CATEGORIES[category];
  return (
    <View style={[styles.badge, { borderColor: config.color }]}>
      <Text style={[styles.label, { color: config.color }]}>{config.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    borderRadius: R.pill,
    borderWidth: S.px,
    backgroundColor: Colors.bgSurface,
    paddingHorizontal: S.md,
    paddingVertical: S.xs,
  },
  label: {
    fontFamily: F.family.monoBold,
    fontSize: F.size.xs,
    textTransform: 'uppercase',
  },
});
