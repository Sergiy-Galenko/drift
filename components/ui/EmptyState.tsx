import { StyleSheet, View } from 'react-native';
import { LocalizedText as Text } from '@/components/ui/LocalizedText';

import { Colors, F, S } from '@/constants/tokens';
import { useTranslation } from '@/hooks/useTranslation';

type EmptyStateProps = {
  title: string;
  message: string;
};

export function EmptyState({ title, message }: EmptyStateProps) {
  const { t } = useTranslation();
  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>{t(title)}</Text>
      <Text style={styles.message}>{t(message)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
    margin: S.lg,
    borderWidth: S.px,
    borderColor: Colors.slate,
    borderRadius: 6,
    backgroundColor: Colors.surfaceRaised,
    padding: S.x4,
    gap: S.sm,
  },
  title: {
    color: Colors.dossier,
    fontFamily: F.family.displayBold,
    fontSize: F.size.xl,
    textAlign: 'center',
  },
  message: {
    color: Colors.textSecondary,
    fontFamily: F.family.bodyRegular,
    fontSize: F.size.base,
    lineHeight: F.size.base * F.lineHeight.normal,
    textAlign: 'center',
  },
});
