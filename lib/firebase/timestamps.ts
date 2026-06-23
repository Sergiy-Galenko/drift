export function timestampToDate(value: unknown, fallback: Date = new Date()): Date {
  if (value instanceof Date) {
    return value;
  }

  if (value && typeof value === 'object') {
    const maybeTimestamp = value as { toDate?: unknown };
    if (typeof maybeTimestamp.toDate === 'function') {
      return maybeTimestamp.toDate();
    }
  }

  return fallback;
}

export function nullableTimestampToDate(value: unknown): Date | null {
  return value == null ? null : timestampToDate(value);
}
