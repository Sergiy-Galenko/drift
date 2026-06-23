import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { DriftCardCompact } from '@/components/drift/DriftCardCompact';
import { Header } from '@/components/navigation/Header';
import { Avatar } from '@/components/ui/Avatar';
import { EmptyState } from '@/components/ui/EmptyState';
import { Input } from '@/components/ui/Input';
import { Spinner } from '@/components/ui/Spinner';
import { CATEGORY_ORDER, CATEGORIES } from '@/constants/categories';
import { Colors, F, R, S } from '@/constants/tokens';
import { useSearch } from '@/hooks/useSearch';
import { getTrending } from '@/lib/firebase/trending';
import type { Drift } from '@/types/drift';
import { logger } from '@/utils/logger';

export default function ExploreScreen() {
  const router = useRouter();
  const [term, setTerm] = useState('');
  const [trending, setTrending] = useState<Drift[]>([]);
  const { results, loading } = useSearch(term);

  useEffect(() => {
    let mounted = true;
    getTrending('daily')
      .then((items) => {
        if (mounted) setTrending(items);
      })
      .catch((error: unknown) => {
        logger.warn('Trending fetch failed', { error: String(error) });
      });

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <View style={styles.root}>
      <Header title="Explore" />
      <ScrollView contentContainerStyle={styles.content}>
        <Input label="Search drifts and users" value={term} onChangeText={setTerm} placeholder="career, @name, proof..." autoCapitalize="none" />
        <View style={styles.grid}>
          {CATEGORY_ORDER.map((category) => (
            <Pressable key={category} style={styles.category}>
              <Text style={[styles.categoryText, { color: CATEGORIES[category].color }]}>{CATEGORIES[category].label}</Text>
            </Pressable>
          ))}
        </View>
        {loading ? <Spinner label="Searching" /> : null}
        {term.trim().length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>USERS</Text>
            {results.users.map((user) => (
              <Pressable
                key={user.uid}
                onPress={() => router.push({ pathname: '/(user)/[username]', params: { username: user.username } })}
                style={styles.userRow}
              >
                <Avatar username={user.username} avatarUrl={user.avatarUrl} reputationScore={user.reputationScore} size={38} />
                <View style={styles.userText}>
                  <Text style={styles.username}>@{user.username}</Text>
                  <Text style={styles.meta}>{user.reputationScore} reputation</Text>
                </View>
              </Pressable>
            ))}
            <Text style={styles.sectionTitle}>DRIFTS</Text>
            {results.drifts.map((drift) => (
              <DriftCardCompact key={drift.id} drift={drift} />
            ))}
            {results.drifts.length === 0 && results.users.length === 0 ? (
              <EmptyState title="No hits" message="Try a different term or category." />
            ) : null}
          </View>
        ) : (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>TRENDING TODAY</Text>
            {trending.map((drift) => (
              <DriftCardCompact key={drift.id} drift={drift} />
            ))}
            {trending.length === 0 ? <EmptyState title="Nothing trending" message="Trending will populate as drifts get votes." /> : null}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.bgBase,
  },
  content: {
    padding: S.lg,
    gap: S.x2,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: S.md,
  },
  category: {
    width: '30%',
    minWidth: 96,
    borderRadius: R.md,
    borderWidth: S.px,
    borderColor: Colors.strokeStrong,
    backgroundColor: Colors.bgSurface,
    padding: S.lg,
  },
  categoryText: {
    fontFamily: F.family.displayBold,
    fontSize: F.size.base,
  },
  section: {
    gap: S.lg,
  },
  sectionTitle: {
    color: Colors.textPrimary,
    fontFamily: F.family.monoBold,
    fontSize: F.size.sm,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: S.md,
    borderRadius: R.md,
    borderWidth: S.px,
    borderColor: Colors.stroke,
    backgroundColor: Colors.bgSurface,
    padding: S.md,
  },
  userText: {
    flex: 1,
    gap: S.xs,
  },
  username: {
    color: Colors.textPrimary,
    fontFamily: F.family.bodySemi,
    fontSize: F.size.base,
  },
  meta: {
    color: Colors.textMuted,
    fontFamily: F.family.monoMedium,
    fontSize: F.size.xs,
  },
});
