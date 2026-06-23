import { StyleSheet, View } from 'react-native';

import { FeaturedBanner } from '@/components/feed/FeaturedBanner';
import { FeedList } from '@/components/feed/FeedList';
import { FilterPills } from '@/components/feed/FilterPills';
import { Header } from '@/components/navigation/Header';
import { Colors, S } from '@/constants/tokens';
import { useFeed } from '@/hooks/useFeed';

export default function FeedScreen() {
  const feed = useFeed();

  return (
    <View style={styles.root}>
      <Header title="DRIFT" />
      <View style={styles.filters}>
        <FilterPills value={feed.category} onChange={feed.setCategory} />
      </View>
      <FeedList
        drifts={feed.drifts}
        loading={feed.loading}
        refreshing={feed.refreshing}
        onRefresh={feed.refresh}
        onEndReached={feed.loadMore}
        header={<FeaturedBanner drifts={feed.featured} />}
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
    paddingVertical: S.md,
  },
});
