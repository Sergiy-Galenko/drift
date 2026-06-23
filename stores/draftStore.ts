import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { DriftCategory } from '@/types/drift';

type DraftFields = {
  hasDraft: boolean;
  text: string;
  stake: string;
  context: string;
  category: DriftCategory | null;
  isAnonymous: boolean;
  currentStep: number;
};

interface DraftStore extends DraftFields {
  saveDraft: (data: Partial<DraftFields>) => void;
  clearDraft: () => void;
}

const initialDraft: DraftFields = {
  hasDraft: false,
  text: '',
  stake: '',
  context: '',
  category: null,
  isAnonymous: false,
  currentStep: 0,
};

export const useDraftStore = create<DraftStore>()(
  persist(
    (set) => ({
      ...initialDraft,
      saveDraft: (data) => set((state) => ({ ...state, ...data, hasDraft: true })),
      clearDraft: () => set(initialDraft),
    }),
    {
      name: 'drift_create_draft_v1',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
