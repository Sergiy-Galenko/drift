import { create } from 'zustand';

export type ToastTone = 'success' | 'warning' | 'danger' | 'neutral';

export type ToastItem = {
  id: string;
  title: string;
  message?: string;
  tone: ToastTone;
};

interface UIStore {
  toastQueue: ToastItem[];
  activeSheet: string | null;
  pushToast: (item: Omit<ToastItem, 'id'>) => void;
  dismissToast: (id: string) => void;
  openSheet: (id: string) => void;
  closeSheet: () => void;
}

function makeId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export const useUIStore = create<UIStore>((set) => ({
  toastQueue: [],
  activeSheet: null,
  pushToast: (item) =>
    set((state) => ({
      toastQueue: [...state.toastQueue, { ...item, id: makeId() }],
    })),
  dismissToast: (id) =>
    set((state) => ({
      toastQueue: state.toastQueue.filter((item) => item.id !== id),
    })),
  openSheet: (id) => set({ activeSheet: id }),
  closeSheet: () => set({ activeSheet: null }),
}));
