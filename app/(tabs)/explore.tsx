import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { DriftCardCompact } from '@/components/drift/DriftCardCompact';
import { Header } from '@/components/navigation/Header';
import { UserResultCard } from '@/components/search/UserResultCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { Input } from '@/components/ui/Input';
import { Spinner } from '@/components/ui/Spinner';
import { Colors, F, R, S } from '@/constants/tokens';
import { useSearch } from '@/hooks/useSearch';
import { getTrending } from '@/lib/firebase/trending';
import { getDiscoverUsers } from '@/lib/firebase/users';
import { useAuthStore } from '@/stores/authStore';
import type { Drift } from '@/types/drift';
import type { UserProfile } from '@/types/user';
import { logger } from '@/utils/logger';

type SearchTab = 'people' | 'posts';

function isUnavailableError(error: unknown): boolean {
  const message = String(error).toLowerCase();
  return message.includes('unavailable') || message.includes('offline');
}

export default function ExploreScreen() {
  const currentUid = useAuthStore((state) => state.firebaseUser?.uid);
  const [term, setTerm] = useState('');
  const [tab, setTab] = useState<SearchTab>('people');
  const [trending, setTrending] = useState<Drift[]>([]);
  const [discoverUsers, setDiscoverUsers] = useState<UserProfile[]>([]);
  const [discoverLoading, setDiscoverLoading] = useState(true);
  const { results, loading } = useSearch(term);
  const normalizedTerm = term.trim();

  useEffect(() => {
    let mounted = true;

    Promise.allSettled([getTrending('daily'), getDiscoverUsers(10)])
      .then(([trendingResult, usersResult]) => {
        if (!mounted) {
          return;
        }

        if (trendingResult.status === 'fulfilled') {
          setTrending(trendingResult.value);
        } else if (!isUnavailableError(trendingResult.reason)) {
          logger.warn('Trending fetch failed', { error: String(trendingResult.reason) });
        }

        if (usersResult.status === 'fulfilled') {
          setDiscoverUsers(usersResult.value.filter((user) => user.uid !== currentUid));
        } else if (!isUnavailableError(usersResult.reason)) {
          logger.warn('Discover users fetch failed', { error: String(usersResult.reason) });
        }
      })
      .finally(() => {
        if (mounted) {
          setDiscoverLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, [currentUid]);

  const visiblePeople = useMemo(
    () => results.users.filter((user) => user.uid !== currentUid),
    [currentUid, results.users],
  );
  const tabs = useMemo(
    () => [
      { key: 'people' as const, label: `People${visiblePeople.length > 0 ? ` (${visiblePeople.length})` : ''}` },
      { key: 'posts' as const, label: `Posts${results.drifts.length > 0 ? ` (${results.drifts.length})` : ''}` },
    ],
    [results.drifts.length, visiblePeople.length],
  );

  const showSearchResults = normalizedTerm.length > 0;

  return (
    <View style={styles.root}>
      <Header title="Search" showBack />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.hero}>
          <Text style={styles.heroTitle}>Find people, open profiles, and browse their public posts.</Text>
          <Text style={styles.heroCopy}>Search by username for people or by text for commitments and proof-related posts.</Text>
        </View>

        <Input
          label="Search people or posts"
          value={term}
          onChangeText={setTerm}
          placeholder="@username, marathon, career..."
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="off"
        />

        {showSearchResults ? (
          <>
            <View style={styles.tabs}>
              {tabs.map((item) => (
                <Pressable
                  key={item.key}
                  onPress={() => setTab(item.key)}
                  style={[styles.tabButton, tab === item.key ? styles.tabButtonActive : null]}
                >
                  <Text style={[styles.tabLabel, tab === item.key ? styles.tabLabelActive : null]}>{item.label}</Text>
                </Pressable>
              ))}
            </View>

            {loading ? <Spinner label="Searching" size="large" /> : null}

            {!loading && tab === 'people' ? (
              <View style={styles.section}>
                {visiblePeople.map((user) => (
                  <UserResultCard key={user.uid} user={user} />
                ))}
                {visiblePeople.length === 0 ? (
                  <EmptyState title="No people found" message="Try another username or remove the @ prefix." />
                ) : null}
              </View>
            ) : null}

            {!loading && tab === 'posts' ? (
              <View style={styles.section}>
                {results.drifts.map((drift) => (
                  <DriftCardCompact key={drift.id} drift={drift} />
                ))}
                {results.drifts.length === 0 ? (
                  <EmptyState title="No posts found" message="Try another keyword, topic, or decision phrase." />
                ) : null}
              </View>
            ) : null}
          </>
        ) : (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>People To Follow</Text>
              {discoverLoading ? <Spinner label="Loading people" /> : null}
              {!discoverLoading && discoverUsers.slice(0, 6).map((user) => <UserResultCard key={user.uid} user={user} />)}
              {!discoverLoading && discoverUsers.length === 0 ? (
                <EmptyState title="No people yet" message="User discovery will appear here as profiles get active." />
              ) : null}
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Trending Posts</Text>
              {discoverLoading ? <Spinner label="Loading posts" /> : null}
              {!discoverLoading && trending.map((drift) => <DriftCardCompact key={drift.id} drift={drift} />)}
              {!discoverLoading && trending.length === 0 ? (
                <EmptyState title="Nothing trending" message="Trending posts will show up here once voting activity increases." />
              ) : null}
            </View>
          </>
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
    paddingBottom: S.x7,
    gap: S.lg,
  },
  hero: {
    gap: S.sm,
  },
  heroTitle: {
    color: Colors.textPrimary,
    fontFamily: F.family.displayBold,
    fontSize: F.size.xl,
    lineHeight: F.size.xl * F.lineHeight.normal,
  },
  heroCopy: {
    color: Colors.textSecondary,
    fontFamily: F.family.bodyRegular,
    fontSize: F.size.base,
    lineHeight: F.size.base * F.lineHeight.normal,
  },
  tabs: {
    flexDirection: 'row',
    gap: S.sm,
  },
  tabButton: {
    flex: 1,
    minHeight: 40,
    borderRadius: R.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surfaceRaised,
  },
  tabButtonActive: {
    backgroundColor: Colors.white,
  },
  tabLabel: {
    color: Colors.textSecondary,
    fontFamily: F.family.bodySemi,
    fontSize: F.size.sm,
  },
  tabLabelActive: {
    color: Colors.black,
  },
  section: {
    gap: S.md,
  },
  sectionTitle: {
    color: Colors.textPrimary,
    fontFamily: F.family.monoBold,
    fontSize: F.size.sm,
    textTransform: 'uppercase',
  },
});
