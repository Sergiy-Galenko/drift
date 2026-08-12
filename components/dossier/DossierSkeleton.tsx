import { StyleSheet, View } from 'react-native';

import { SkeletonBlock } from '@/components/ui/SkeletonBlock';
import { Colors, R, S } from '@/constants/tokens';

type DossierSkeletonProps = { rows?: number };

export function DossierSkeleton({ rows = 3 }: DossierSkeletonProps) {
  return (
    <View style={styles.wrap}>
      {Array.from({ length: rows }, (_, index) => (
        <View key={index} style={styles.card}>
          <SkeletonBlock style={styles.shortLine} />
          <SkeletonBlock style={styles.longLine} />
          <SkeletonBlock style={styles.midLine} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: S.md, padding: S.lg },
  card: {
    gap: S.sm,
    borderWidth: S.px,
    borderColor: Colors.paperLine,
    borderRadius: R.md,
    backgroundColor: Colors.dossier,
    padding: S.lg,
  },
  shortLine: { width: '32%', height: S.sm, backgroundColor: Colors.paperLine },
  midLine: { width: '62%', height: S.sm, backgroundColor: Colors.paperLine },
  longLine: { width: '88%', height: S.lg, backgroundColor: Colors.paperLine },
});
