import { StyleSheet, Text, View } from 'react-native';

import { Colors, F, R, S } from '@/constants/tokens';
import type { Drift } from '@/types/drift';
import { formatCountdown } from '@/utils/countdown';

type StatusBannerProps = {
  drift: Drift;
};

export function StatusBanner({ drift }: StatusBannerProps) {
  if (drift.status === 'active') {
    return null;
  }

  const label =
    drift.status === 'proof_pending'
      ? `Vote locked: ${drift.result?.toUpperCase()} won. Proof due ${drift.proofDeadline ? formatCountdown(drift.proofDeadline) : 'soon'}.`
      : drift.status === 'executed'
        ? 'Executed. Proof is live.'
        : drift.status === 'failed'
          ? 'Failed. Reputation took the hit.'
          : drift.status === 'cancelled'
            ? 'Cancelled.'
            : `Decided: ${drift.result?.toUpperCase() ?? 'NO RESULT'}`;

  return (
    <View style={[styles.banner, drift.status === 'failed' ? styles.failed : styles.active]}>
      <Text style={styles.text}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    borderRadius: R.md,
    borderWidth: S.px,
    padding: S.md,
  },
  active: {
    borderColor: Colors.accentAmber,
    backgroundColor: Colors.bgSurface,
  },
  failed: {
    borderColor: Colors.accentFire,
    backgroundColor: Colors.bgSurface,
  },
  text: {
    color: Colors.textPrimary,
    fontFamily: F.family.bodySemi,
    fontSize: F.size.sm,
  },
});
