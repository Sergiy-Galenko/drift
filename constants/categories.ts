import { Colors } from './tokens';
import type { DriftCategory } from '@/types/drift';

export type CategoryConfig = {
  label: string;
  color: string;
  emoji: null;
};

export const CATEGORIES: Record<DriftCategory, CategoryConfig> = {
  life: { label: 'Life', color: Colors.accentVolt, emoji: null },
  career: { label: 'Career', color: Colors.accentIce, emoji: null },
  love: { label: 'Love', color: Colors.accentFire, emoji: null },
  money: { label: 'Money', color: Colors.accentAmber, emoji: null },
  health: { label: 'Health', color: Colors.accentIce, emoji: null },
  random: { label: 'Random', color: Colors.textSecondary, emoji: null },
} as const;

export const CATEGORY_ORDER: DriftCategory[] = ['life', 'career', 'love', 'money', 'health', 'random'];

export type CategoryFilter = 'all' | DriftCategory;
