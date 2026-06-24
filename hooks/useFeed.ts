import { useCallback, useEffect, useMemo, useState } from 'react';
import { InteractionManager } from 'react-native';

import type { CategoryFilter } from '@/constants/categories';
import { subscribeFeaturedDrifts, subscribeFeedDrifts } from '@/lib/firebase/drifts';
import { useFeedStore } from '@/stores/feedStore';
import { useUIStore } from '@/stores/uiStore';
import type { Drift } from '@/types/drift';
import { firebaseErrorMessage } from '@/utils/formatters';
import { logger } from '@/utils/logger';

export function useFeed() {
  const [category, setCategory] = useState<CategoryFilter>('all');
  const [limitCount, setLimitCount] = useState(20);
  const [reloadToken, setReloadToken] = useState(0);
  const [featured, setFeatured] = useState<Drift[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const driftsById = useFeedStore((state) => state.drifts);
  const setDrifts = useFeedStore((state) => state.setDrifts);
  const pushToast = useUIStore((state) => state.pushToast);

  useEffect(() => {
    setLoading(true);
    let active = true;
    let unsubscribe: (() => void) | undefined;
    const task = InteractionManager.runAfterInteractions(() => {
      if (!active) {
        return;
      }

      unsubscribe = subscribeFeedDrifts(
        category,
        limitCount,
        (items) => {
          setDrifts(items);
          setLoading(false);
          setRefreshing(false);
        },
        (message) => {
          logger.error('Feed subscription failed', { message });
          pushToast({ title: 'Feed unavailable', message: firebaseErrorMessage(message), tone: 'danger' });
          setLoading(false);
          setRefreshing(false);
        },
      );
    });

    return () => {
      active = false;
      task.cancel();
      unsubscribe?.();
    };
  }, [category, limitCount, pushToast, reloadToken, setDrifts]);

  useEffect(() => {
    let active = true;
    let unsubscribe: (() => void) | undefined;
    const task = InteractionManager.runAfterInteractions(() => {
      if (!active) {
        return;
      }

      unsubscribe = subscribeFeaturedDrifts(
        setFeatured,
        (message) => {
          logger.warn('Featured subscription failed', { message });
        },
      );
    });

    return () => {
      active = false;
      task.cancel();
      unsubscribe?.();
    };
  }, []);

  const drifts = useMemo(
    () => Object.values(driftsById).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()),
    [driftsById],
  );

  const refresh = useCallback(() => {
    setRefreshing(true);
    setReloadToken((value) => value + 1);
  }, []);

  const loadMore = useCallback(() => {
    setLimitCount((count) => count + 10);
  }, []);

  return {
    category,
    setCategory,
    drifts,
    featured,
    loading,
    refreshing,
    refresh,
    loadMore,
  };
}
