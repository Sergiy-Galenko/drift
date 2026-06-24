import { StyleSheet, View } from 'react-native';

import { SkeletonBlock } from '@/components/ui/SkeletonBlock';
import { Colors, R, S } from '@/constants/tokens';

export function FeedSkeleton() {
  return (
    <View style={styles.root}>
      <View style={styles.stories}>
        {Array.from({ length: 6 }).map((_, index) => (
          <View key={index} style={styles.storyItem}>
            <SkeletonBlock style={styles.storyRing} />
            <SkeletonBlock style={styles.storyLabel} />
          </View>
        ))}
      </View>
      <SkeletonBlock style={styles.banner} />
      {Array.from({ length: 2 }).map((_, index) => (
        <View key={index} style={styles.card}>
          <View style={styles.cardHeader}>
            <SkeletonBlock style={styles.avatar} />
            <View style={styles.cardHeaderText}>
              <SkeletonBlock style={styles.lineShort} />
              <SkeletonBlock style={styles.lineTiny} />
            </View>
          </View>
          <SkeletonBlock style={styles.media} />
          <View style={styles.cardMeta}>
            <SkeletonBlock style={styles.lineFull} />
            <SkeletonBlock style={styles.lineLarge} />
            <SkeletonBlock style={styles.lineMedium} />
            <SkeletonBlock style={styles.voteBar} />
            <View style={styles.actions}>
              <SkeletonBlock style={styles.action} />
              <SkeletonBlock style={styles.action} />
            </View>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.bgBase,
    paddingBottom: S.x6,
    gap: S.lg,
  },
  stories: {
    flexDirection: 'row',
    gap: S.md,
    paddingHorizontal: S.md,
    paddingTop: S.md,
  },
  storyItem: {
    alignItems: 'center',
    gap: S.xs,
  },
  storyRing: {
    width: 60,
    height: 60,
    borderRadius: R.pill,
  },
  storyLabel: {
    width: 44,
    height: 8,
    borderRadius: R.pill,
  },
  banner: {
    height: 140,
    marginHorizontal: S.md,
    borderRadius: R.md,
  },
  card: {
    gap: S.md,
    borderBottomWidth: S.px,
    borderBottomColor: Colors.separator,
    paddingBottom: S.lg,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: S.sm,
    paddingHorizontal: S.md,
  },
  cardHeaderText: {
    flex: 1,
    gap: S.xs,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: R.pill,
  },
  media: {
    minHeight: 340,
    marginHorizontal: S.md,
    borderRadius: R.md,
  },
  cardMeta: {
    gap: S.sm,
    paddingHorizontal: S.md,
  },
  lineFull: {
    width: '50%',
    height: 12,
    borderRadius: R.pill,
  },
  lineLarge: {
    width: '88%',
    height: 28,
    borderRadius: R.sm,
  },
  lineMedium: {
    width: '70%',
    height: 16,
    borderRadius: R.sm,
  },
  lineShort: {
    width: '34%',
    height: 12,
    borderRadius: R.pill,
  },
  lineTiny: {
    width: '22%',
    height: 8,
    borderRadius: R.pill,
  },
  voteBar: {
    width: '100%',
    height: 10,
    borderRadius: R.pill,
  },
  actions: {
    flexDirection: 'row',
    gap: S.md,
    paddingTop: S.xs,
  },
  action: {
    width: 132,
    height: 42,
    borderRadius: R.pill,
  },
});
