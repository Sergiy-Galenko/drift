import { FlatList, RefreshControl, StyleSheet, View, useWindowDimensions, type ListRenderItemInfo } from 'react-native';

import { DriftReelCard } from '@/components/drift/DriftReelCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { Spinner } from '@/components/ui/Spinner';
import { Colors } from '@/constants/tokens';
import { useFeed } from '@/hooks/useFeed';
import type { Drift } from '@/types/drift';

export default function ReelsScreen() {
  const feed = useFeed();
  const { height } = useWindowDimensions();

  if (feed.loading && feed.drifts.length === 0) {
    return <Spinner label="Loading votes" />;
  }

  return (
    <View style={styles.root}>
      <FlatList
        data={feed.drifts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }: ListRenderItemInfo<Drift>) => <DriftReelCard drift={item} height={height} />}
        pagingEnabled
        snapToInterval={height}
        decelerationRate="fast"
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={feed.refreshing} onRefresh={feed.refresh} tintColor={Colors.white} />}
        ListEmptyComponent={<EmptyState title="No votes yet" message="Active drifts will appear here as a vertical voting feed." />}
        onEndReached={feed.loadMore}
        onEndReachedThreshold={0.5}
        getItemLayout={(_, index) => ({ length: height, offset: height * index, index })}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.black,
  },
});
