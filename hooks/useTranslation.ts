import { useCallback } from 'react';

import { translate } from '@/lib/i18n';
import { useLocaleStore } from '@/stores/localeStore';

export function useTranslation() {
  const locale = useLocaleStore((state) => state.locale);
  const t = useCallback((value: string) => translate(locale, value), [locale]);

  return { locale, t };
}
