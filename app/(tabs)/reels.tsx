import { useCallback } from 'react';
import { FlatList, RefreshControl, StyleSheet, View, useWindowDimensions, type ListRenderItemInfo } from 'react-native';

import { DriftReelCard } from '@/components/drift/DriftReelCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { Spinner } from '@/components/ui/Spinner';
import { Colors } from '@/constants/tokens';
import { useFeed } from '@/hooks/useFeed';
import type { Drift } from '@/types/drift';

export default function ReelsScreen() {
  const feed = useFeed({ includeFeatured: false });
  const { height } = useWindowDimensions();
  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<Drift>) => <DriftReelCard drift={item} height={height} />,
    [height],
  );
  const keyExtractor = useCallback((item: Drift) => item.id, []);
  const getItemLayout = useCallback((_: ArrayLike<Drift> | null | undefined, index: number) => ({
    length: height,
    offset: height * index,
    index,
  }), [height]);

  if (feed.loading && feed.drifts.length === 0) {
    return <Spinner label="Loading votes" />;
  }

  return (
    <View style={styles.root}>
      <FlatList
        data={feed.drifts}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        pagingEnabled
        snapToInterval={height}
        decelerationRate="fast"
        initialNumToRender={1}
        maxToRenderPerBatch={2}
        windowSize={3}
        removeClippedSubviews
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={feed.refreshing} onRefresh={feed.refresh} tintColor={Colors.white} />}
        ListEmptyComponent={<EmptyState title="No votes yet" message="Active drifts will appear here as a vertical voting feed." />}
        onEndReached={feed.loadMore}
        onEndReachedThreshold={0.5}
        getItemLayout={getItemLayout}
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
