import { useSyncExternalStore } from 'react';

type ClockListener = () => void;

const listeners = new Set<ClockListener>();
let now = Date.now();
let interval: ReturnType<typeof setInterval> | null = null;

function notifyListeners(): void {
  now = Date.now();
  listeners.forEach((listener) => listener());
}

function subscribe(listener: ClockListener): () => void {
  listeners.add(listener);

  if (!interval) {
    interval = setInterval(notifyListeners, 1000);
  }

  return () => {
    listeners.delete(listener);

    if (listeners.size === 0 && interval) {
      clearInterval(interval);
      interval = null;
    }
  };
}

function getSnapshot(): number {
  return now;
}

export function useNow(): number {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
