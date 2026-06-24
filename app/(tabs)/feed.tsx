import { useMemo } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { FeaturedBanner } from '@/components/feed/FeaturedBanner';
import { FeedList } from '@/components/feed/FeedList';
import { FilterPills } from '@/components/feed/FilterPills';
import { Header } from '@/components/navigation/Header';
import { ProfileShortcut } from '@/components/navigation/ProfileShortcut';
import { SearchShortcut } from '@/components/navigation/SearchShortcut';
import { StoryPreview } from '@/components/story/StoryPreview';
import { Colors, S } from '@/constants/tokens';
import { useFeed } from '@/hooks/useFeed';

export default function FeedScreen() {
  const feed = useFeed();
  const header = useMemo(
    () => (
      <>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.stories}>
          {(feed.featured.length > 0 ? feed.featured : feed.drifts.slice(0, 8)).map((drift) => (
            <StoryPreview key={drift.id} drift={drift} />
          ))}
        </ScrollView>
        <FeaturedBanner drifts={feed.featured} />
      </>
    ),
    [feed.drifts, feed.featured],
  );

  return (
    <View style={styles.root}>
      <Header
        title="DRIFT"
        right={
          <View style={styles.headerActions}>
            <SearchShortcut />
            <ProfileShortcut />
          </View>
        }
      />
      <View style={styles.filters}>
        <FilterPills value={feed.category} onChange={feed.setCategory} />
      </View>
      <FeedList
        drifts={feed.drifts}
        loading={feed.loading}
        refreshing={feed.refreshing}
        onRefresh={feed.refresh}
        onEndReached={feed.loadMore}
        header={header}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.bgBase,
  },
  filters: {
    paddingVertical: S.sm,
    borderBottomWidth: S.px,
    borderBottomColor: Colors.separator,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: S.xs,
  },
  stories: {
    paddingHorizontal: S.md,
    paddingVertical: S.md,
    gap: S.sm,
  },
});
