import { StyleSheet, View } from 'react-native';

import { SkeletonBlock } from '@/components/ui/SkeletonBlock';
import { Colors, R, S } from '@/constants/tokens';

export function ActivitySkeleton() {
  return (
    <View style={styles.root}>
      <View style={styles.tabs}>
        <SkeletonBlock style={styles.tab} />
        <SkeletonBlock style={styles.tab} />
      </View>
      {Array.from({ length: 5 }).map((_, index) => (
        <View key={index} style={styles.item}>
          <SkeletonBlock style={styles.lineTitle} />
          <SkeletonBlock style={styles.lineBody} />
          <SkeletonBlock style={styles.lineMeta} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.bgBase,
    padding: S.lg,
    gap: S.lg,
  },
  tabs: {
    flexDirection: 'row',
    gap: S.sm,
  },
  tab: {
    flex: 1,
    height: 36,
    borderRadius: R.pill,
  },
  item: {
    gap: S.sm,
    borderRadius: R.md,
    borderWidth: S.px,
    borderColor: Colors.stroke,
    backgroundColor: Colors.bgSurface,
    padding: S.lg,
  },
  lineTitle: {
    width: '42%',
    height: 12,
    borderRadius: R.pill,
  },
  lineBody: {
    width: '86%',
    height: 16,
    borderRadius: R.sm,
  },
  lineMeta: {
    width: '26%',
    height: 10,
    borderRadius: R.pill,
  },
});
