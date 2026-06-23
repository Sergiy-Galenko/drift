import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { CategoryBadge } from './CategoryBadge';
import { VoteBar } from './VoteBar';
import { Colors, F, R, S } from '@/constants/tokens';
import type { Drift } from '@/types/drift';

type DriftCardCompactProps = {
  drift: Drift;
};

export function DriftCardCompact({ drift }: DriftCardCompactProps) {
  const router = useRouter();
  return (
    <Pressable onPress={() => router.push({ pathname: '/(drift)/[id]', params: { id: drift.id } })} style={styles.card}>
      <View style={styles.row}>
        <Text style={styles.author}>@{drift.authorUsername}</Text>
        <CategoryBadge category={drift.category} />
      </View>
      <Text numberOfLines={2} style={styles.text}>{drift.text}</Text>
      <VoteBar votesYes={drift.votesYes} votesNo={drift.votesNo} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: S.md,
    borderRadius: R.md,
    borderWidth: S.px,
    borderColor: Colors.stroke,
    backgroundColor: Colors.bgSurface,
    padding: S.lg,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: S.sm,
  },
  author: {
    color: Colors.textSecondary,
    fontFamily: F.family.bodySemi,
    fontSize: F.size.sm,
  },
  text: {
    color: Colors.textPrimary,
    fontFamily: F.family.displayBold,
    fontSize: F.size.md,
    lineHeight: F.size.md * F.lineHeight.normal,
  },
});
