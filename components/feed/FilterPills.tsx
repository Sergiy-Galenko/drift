import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';

import { CATEGORY_ORDER, CATEGORIES, type CategoryFilter } from '@/constants/categories';
import { Colors, F, R, S } from '@/constants/tokens';

type FilterPillsProps = {
  value: CategoryFilter;
  onChange: (category: CategoryFilter) => void;
};

const filters: CategoryFilter[] = ['all', ...CATEGORY_ORDER];

export function FilterPills({ value, onChange }: FilterPillsProps) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.content}>
      {filters.map((filter) => {
        const active = value === filter;
        const label = filter === 'all' ? 'All' : CATEGORIES[filter].label;
        return (
          <Pressable
            key={filter}
            accessibilityRole="button"
            onPress={() => onChange(filter)}
            style={[styles.pill, active ? styles.active : null]}
          >
            <Text style={[styles.label, active ? styles.activeLabel : null]}>{label}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: S.sm,
    paddingHorizontal: S.lg,
  },
  pill: {
    borderRadius: R.pill,
    borderWidth: S.px,
    borderColor: Colors.strokeStrong,
    backgroundColor: Colors.bgSurface,
    paddingHorizontal: S.lg,
    paddingVertical: S.sm,
  },
  active: {
    borderColor: Colors.white,
    backgroundColor: Colors.white,
  },
  label: {
    color: Colors.textSecondary,
    fontFamily: F.family.monoBold,
    fontSize: F.size.xs,
    textTransform: 'uppercase',
  },
  activeLabel: {
    color: Colors.black,
  },
});
