import { FlatList, RefreshControl, StyleSheet, View, type ListRenderItemInfo } from 'react-native';

import { DriftCard } from '@/components/drift/DriftCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { Spinner } from '@/components/ui/Spinner';
import { Colors, S } from '@/constants/tokens';
import type { Drift } from '@/types/drift';

type FeedListProps = {
  drifts: Drift[];
  loading: boolean;
  refreshing: boolean;
  onRefresh: () => void;
  onEndReached?: () => void;
  header?: React.ReactElement;
};

const ITEM_HEIGHT = 380;

export function FeedList({ drifts, loading, refreshing, onRefresh, onEndReached, header }: FeedListProps) {
  if (loading && drifts.length === 0) {
    return <Spinner label="Loading drifts" />;
  }

  return (
    <FlatList
      data={drifts}
      keyExtractor={(item) => item.id}
      renderItem={({ item, index }: ListRenderItemInfo<Drift>) => <DriftCard drift={item} index={index} />}
      ListHeaderComponent={header ? <View style={styles.header}>{header}</View> : null}
      ListEmptyComponent={<EmptyState title="No drifts yet" message="Change the filter or create the first commitment." />}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.accentVolt} />}
      onEndReached={onEndReached}
      onEndReachedThreshold={0.5}
      getItemLayout={(_, index) => ({ length: ITEM_HEIGHT, offset: ITEM_HEIGHT * index, index })}
    />
  );
}

const styles = StyleSheet.create({
  content: {
    padding: S.lg,
    gap: S.lg,
  },
  header: {
    gap: S.lg,
  },
});
