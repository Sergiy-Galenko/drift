import type { DriftCategory } from '@/types/drift';

export type CategoryFilter = DriftCategory | 'all';

export const categories = ['life', 'career', 'love', 'money', 'random'] as const satisfies readonly DriftCategory[];

export const categoryOptions: readonly { label: string; value: CategoryFilter }[] = [
  { label: 'All', value: 'all' },
  { label: 'Life', value: 'life' },
  { label: 'Career', value: 'career' },
  { label: 'Love', value: 'love' },
  { label: 'Money', value: 'money' },
  { label: 'Random', value: 'random' },
];
