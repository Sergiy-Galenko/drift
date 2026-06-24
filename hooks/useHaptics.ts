import { useMemo } from 'react';

import { impactHeavy, impactLight, notifySuccess, notifyWarning, selection } from '@/utils/haptics';

export function useHaptics() {
  return useMemo(
    () => ({
      impactLight,
      impactHeavy,
      selection,
      notifySuccess,
      notifyWarning,
    }),
    [],
  );
}
