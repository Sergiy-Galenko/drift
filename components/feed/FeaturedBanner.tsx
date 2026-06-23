import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { Badge } from '@/components/ui/Badge';
import { Colors, F, R, S } from '@/constants/tokens';
import type { Drift } from '@/types/drift';

type FeaturedBannerProps = {
  drifts: Drift[];
};

export function FeaturedBanner({ drifts }: FeaturedBannerProps) {
  const router = useRouter();
  if (drifts.length === 0) {
    return null;
  }

  return (
    <View style={styles.wrap}>
      <View style={styles.titleRow}>
        <Text style={styles.title}>FEATURED</Text>
        <Badge label={`${drifts.length} live`} tone="volt" />
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.content}>
        {drifts.map((drift) => (
          <Pressable
            key={drift.id}
            onPress={() => router.push({ pathname: '/(drift)/[id]', params: { id: drift.id } })}
            style={styles.card}
          >
            <Text numberOfLines={3} style={styles.text}>{drift.text}</Text>
            <Text style={styles.meta}>{drift.votesYes + drift.votesNo} votes</Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: S.md,
  },
  titleRow: {
    paddingHorizontal: S.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    color: Colors.textPrimary,
    fontFamily: F.family.displayBold,
    fontSize: F.size.lg,
  },
  content: {
    gap: S.md,
    paddingHorizontal: S.lg,
  },
  card: {
    width: 220,
    minHeight: 132,
    borderRadius: R.lg,
    borderWidth: S.px,
    borderColor: Colors.strokeStrong,
    backgroundColor: Colors.bgSurface,
    padding: S.lg,
    justifyContent: 'space-between',
  },
  text: {
    color: Colors.textPrimary,
    fontFamily: F.family.displayBold,
    fontSize: F.size.md,
    lineHeight: F.size.md * F.lineHeight.tight,
  },
  meta: {
    color: Colors.accentVolt,
    fontFamily: F.family.monoBold,
    fontSize: F.size.xs,
    textTransform: 'uppercase',
  },
});
