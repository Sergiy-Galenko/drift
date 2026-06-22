import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { DriftCard } from '@/components/drift/DriftCard';
import { AppHeader } from '@/components/layout/AppHeader';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { categoryOptions, type CategoryFilter } from '@/constants/categories';
import { colors } from '@/constants/colors';
import { fontFamily, radius } from '@/constants/typography';
import { useFeed } from '@/hooks/useFeed';

export default function FeedScreen() {
  const router = useRouter();
  const feed = useFeed();

  const renderEmpty = () => {
    if (feed.loading) {
      return <Spinner />;
    }

    if (feed.error) {
      return (
        <View style={styles.state}>
          <Text style={styles.stateTitle}>Feed failed.</Text>
          <Text style={styles.stateCopy}>{feed.error}</Text>
          <Button label="Retry" variant="primary" onPress={feed.retry} />
        </View>
      );
    }

    return (
      <View style={styles.state}>
        <Text style={styles.stateTitle}>
          {feed.category === 'all' ? 'No active drifts yet.' : `No ${feed.category.toUpperCase()} drifts right now.`}
        </Text>
        <Text style={styles.stateCopy}>Be the first to post one.</Text>
        <Button label={feed.category === 'all' ? 'Create Drift' : 'See all'} variant="primary" onPress={() => {
          if (feed.category === 'all') {
            router.push('/create');
          } else {
            feed.setCategory('all');
          }
        }} />
      </View>
    );
  };

  return (
    <ScreenWrapper showTabs contentStyle={styles.screen}>
      <AppHeader title="Feed" eyebrow="LIVE VOTES" />
      <FlatList
        data={feed.drifts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <DriftCard drift={item} />}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={<CategoryFilters value={feed.category} onChange={feed.setCategory} />}
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={
          feed.drifts.length > 0 ? (
            <View style={styles.footer}>
              <Button label="Load more" variant="ghost" fullWidth onPress={feed.loadMore} />
            </View>
          ) : null
        }
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </ScreenWrapper>
  );
}

function CategoryFilters({ value, onChange }: { value: CategoryFilter; onChange: (category: CategoryFilter) => void }) {
  return (
    <View style={styles.filters}>
      {categoryOptions.map((option) => {
        const active = option.value === value;

        return (
          <Pressable
            key={option.value}
            onPress={() => onChange(option.value)}
            style={[styles.filter, active ? styles.filterActive : null]}
          >
            <Text style={[styles.filterText, active ? styles.filterTextActive : null]}>{option.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    paddingBottom: 0,
  },
  list: {
    paddingBottom: 24,
  },
  separator: {
    height: 14,
  },
  filters: {
    flexDirection: 'row',
    gap: 8,
    paddingBottom: 16,
  },
  filter: {
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.stroke,
    backgroundColor: colors.surface,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  filterActive: {
    borderColor: colors.volt,
    backgroundColor: colors.elevated,
  },
  filterText: {
    color: colors.textMuted,
    fontFamily: fontFamily.monoBold,
    fontSize: 11,
  },
  filterTextActive: {
    color: colors.volt,
  },
  state: {
    minHeight: 260,
    alignItems: 'flex-start',
    justifyContent: 'center',
    gap: 10,
  },
  stateTitle: {
    color: colors.textPrimary,
    fontFamily: fontFamily.displayBold,
    fontSize: 24,
  },
  stateCopy: {
    color: colors.textMuted,
    fontFamily: fontFamily.body,
    fontSize: 14,
  },
  footer: {
    paddingTop: 18,
  },
});
