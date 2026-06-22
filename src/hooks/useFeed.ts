import { useCallback, useEffect } from 'react';

import type { CategoryFilter } from '@/constants/categories';
import { subscribeActiveDrifts } from '@/lib/firebase/drifts';
import { useFeedStore } from '@/stores/feedStore';

export function useFeed() {
  const drifts = useFeedStore((state) => state.drifts);
  const category = useFeedStore((state) => state.category);
  const limitCount = useFeedStore((state) => state.limitCount);
  const loading = useFeedStore((state) => state.loading);
  const error = useFeedStore((state) => state.error);
  const setDrifts = useFeedStore((state) => state.setDrifts);
  const setStoreCategory = useFeedStore((state) => state.setCategory);
  const loadMore = useFeedStore((state) => state.loadMore);
  const setLoading = useFeedStore((state) => state.setLoading);
  const setError = useFeedStore((state) => state.setError);

  useEffect(() => {
    setLoading(true);
    const unsubscribe = subscribeActiveDrifts(category, limitCount, setDrifts, setError);
    return unsubscribe;
  }, [category, limitCount, setDrifts, setError, setLoading]);

  const setCategory = useCallback(
    (category: CategoryFilter) => {
      setStoreCategory(category);
    },
    [setStoreCategory],
  );

  const retry = useCallback(() => {
    setLoading(true);
    setError(null);
  }, [setError, setLoading]);

  return {
    drifts,
    category,
    limitCount,
    loading,
    error,
    loadMore,
    setCategory,
    retry,
  };
}
