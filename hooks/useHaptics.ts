import { useMemo } from 'react';

import { impactHeavy, impactLight, notifySuccess, notifyWarning } from '@/utils/haptics';

export function useHaptics() {
  return useMemo(
    () => ({
      impactLight,
      impactHeavy,
      notifySuccess,
      notifyWarning,
    }),
    [],
  );
}
