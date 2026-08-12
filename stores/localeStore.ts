import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { DEFAULT_LOCALE, type AppLocale } from '@/lib/i18n';

type LocaleState = {
  locale: AppLocale;
  setLocale: (locale: AppLocale) => void;
};

export const useLocaleStore = create<LocaleState>()(
  persist(
    (set) => ({
      locale: DEFAULT_LOCALE,
      setLocale: (locale) => set({ locale }),
    }),
    { name: 'drift_locale_v1', storage: createJSONStorage(() => AsyncStorage) },
  ),
);
