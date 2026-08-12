import { StyleSheet, View } from 'react-native';
import { LocalizedText as Text } from '@/components/ui/LocalizedText';

import { Colors, F, R, S } from '@/constants/tokens';
import { useTranslation } from '@/hooks/useTranslation';
import type { Drift } from '@/types/drift';
import { formatCountdown } from '@/utils/countdown';
import { pollResultLabel } from '@/utils/poll';

type StatusBannerProps = {
  drift: Drift;
};

export function StatusBanner({ drift }: StatusBannerProps) {
  const { t } = useTranslation();
  if (drift.status === 'active') {
    return null;
  }

  const label =
    drift.status === 'proof_pending'
      ? `${t('Vote locked: ')}${pollResultLabel(drift)}${t(' won. Proof due ')}${drift.proofDeadline ? formatCountdown(drift.proofDeadline) : t('soon')}.`
      : drift.status === 'executed'
        ? t('Executed. Proof is live.')
        : drift.status === 'failed'
          ? t('Failed. Reputation took the hit.')
          : drift.status === 'cancelled'
            ? t('Cancelled.')
            : `${t('Decided: ')}${pollResultLabel(drift)}`;

  return (
    <View style={[styles.banner, drift.status === 'failed' ? styles.failed : styles.active]}>
      <Text style={styles.text}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    borderRadius: R.xs,
    borderWidth: S.px,
    padding: S.md,
  },
  active: {
    borderColor: Colors.accentAmber,
    backgroundColor: Colors.dossier,
  },
  failed: {
    borderColor: Colors.accentFire,
    backgroundColor: Colors.dossier,
  },
  text: {
    color: Colors.ink,
    fontFamily: F.family.bodySemi,
    fontSize: F.size.sm,
  },
});
