import { StyleSheet, View } from 'react-native';
import { LocalizedText as Text } from '@/components/ui/LocalizedText';

import { Button } from './Button';
import { Colors, F, S } from '@/constants/tokens';
import { useTranslation } from '@/hooks/useTranslation';

type ErrorStateProps = {
  title: string;
  message: string;
  onRetry?: () => void;
};

export function ErrorState({ title, message, onRetry }: ErrorStateProps) {
  const { t } = useTranslation();
  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>{t(title)}</Text>
      <Text style={styles.message}>{t(message)}</Text>
      {onRetry ? <Button label="Retry" onPress={onRetry} variant="secondary" /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
    margin: S.lg,
    borderWidth: S.px,
    borderColor: Colors.oxblood,
    borderRadius: 6,
    backgroundColor: Colors.surfaceRaised,
    padding: S.x4,
    gap: S.lg,
  },
  title: {
    color: Colors.oxblood,
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
