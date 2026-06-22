import type { DriftCategory } from '@/types/drift';

export function formatCategory(category: DriftCategory): string {
  return category.toUpperCase();
}

export function formatPercent(part: number, total: number): string {
  if (total <= 0) {
    return '0%';
  }

  return `${Math.round((part / total) * 100)}%`;
}

export function formatCompactCount(value: number): string {
  if (value < 1000) {
    return String(value);
  }

  if (value < 1000000) {
    return `${(value / 1000).toFixed(1)}k`;
  }

  return `${(value / 1000000).toFixed(1)}m`;
}

export function formatDateTime(date: Date): string {
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
}
