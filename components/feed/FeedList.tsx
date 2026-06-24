import { useCallback, useMemo, type ReactElement } from 'react';
import { StyleSheet, View } from 'react-native';
import { FlashList, type ListRenderItemInfo } from '@shopify/flash-list';

import { DriftCard } from '@/components/drift/DriftCard';
import { FeedSkeleton } from '@/components/feed/FeedSkeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { S } from '@/constants/tokens';
import type { Drift } from '@/types/drift';

type FeedListProps = {
  drifts: Drift[];
  loading: boolean;
  refreshing: boolean;
  onRefresh: () => void;
  onEndReached?: () => void;
  header?: ReactElement;
};

export function FeedList({ drifts, loading, refreshing, onRefresh, onEndReached, header }: FeedListProps) {
  const renderItem = useCallback(
    ({ item, index }: ListRenderItemInfo<Drift>) => <DriftCard drift={item} index={index} />,
    [],
  );
  const keyExtractor = useCallback((item: Drift) => item.id, []);
  const getItemType = useCallback((item: Drift) => item.status, []);
  const listHeader = useMemo(() => (header ? <View style={styles.header}>{header}</View> : null), [header]);

  if (loading && drifts.length === 0) {
    return <FeedSkeleton />;
  }

  return (
    <FlashList
      data={drifts}
      drawDistance={900}
      overrideProps={{ initialDrawBatchSize: 5 }}
      keyExtractor={keyExtractor}
      renderItem={renderItem}
      getItemType={getItemType}
      ListHeaderComponent={listHeader}
      ListEmptyComponent={<EmptyState title="No drifts yet" message="Change the filter or create the first commitment." />}
      contentContainerStyle={styles.content}
      refreshing={refreshing}
      onRefresh={onRefresh}
      showsVerticalScrollIndicator={false}
      onEndReached={onEndReached}
      onEndReachedThreshold={0.5}
    />
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: S.x7,
  },
  header: {
    gap: S.md,
    paddingBottom: S.sm,
  },
});
