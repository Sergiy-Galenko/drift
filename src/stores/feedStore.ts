import { create } from 'zustand';

import type { CategoryFilter } from '@/constants/categories';
import type { Drift } from '@/types/drift';

type FeedState = {
  drifts: Drift[];
  category: CategoryFilter;
  limitCount: number;
  loading: boolean;
  error: string | null;
  setDrifts: (drifts: Drift[]) => void;
  setCategory: (category: CategoryFilter) => void;
  loadMore: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  resetLimit: () => void;
};

export const useFeedStore = create<FeedState>((set) => ({
  drifts: [],
  category: 'all',
  limitCount: 20,
  loading: true,
  error: null,
  setDrifts: (drifts) => set({ drifts, loading: false, error: null }),
  setCategory: (category) => set({ category, limitCount: 20 }),
  loadMore: () => set((state) => ({ limitCount: state.limitCount + 20 })),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error, loading: false }),
  resetLimit: () => set({ limitCount: 20 }),
}));
