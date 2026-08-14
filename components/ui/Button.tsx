import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { LocalizedText as Text } from '@/components/ui/LocalizedText';

import { Spinner } from './Spinner';
import { Colors, F, R, S } from '@/constants/tokens';
import { useTranslation } from '@/hooks/useTranslation';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';

type ButtonProps = {
  label: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  loading?: boolean;
  icon?: ReactNode;
  testID?: string;
};

function buttonTestId(label: string): string {
  return `button-${label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`;
}

export function Button({ label, onPress, variant = 'primary', disabled = false, loading = false, icon, testID }: ButtonProps) {
  const { t } = useTranslation();
  const isDisabled = disabled || loading;
  const spinnerColor = Colors.dossier;
  return (
    <Pressable
      accessibilityRole="button"
      testID={testID ?? buttonTestId(label)}
      disabled={isDisabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        styles[variant],
        isDisabled ? styles.disabled : null,
        pressed && !isDisabled ? styles.pressed : null,
      ]}
    >
      {loading ? (
        <Spinner label={t(label)} inline color={spinnerColor} />
      ) : (
        <View style={styles.content}>
          {icon}
          <Text style={[styles.label, variant === 'primary' || variant === 'danger' ? styles.primaryLabel : styles.defaultLabel]}>{t(label)}</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 48,
    borderRadius: R.sm,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: S.x2,
    borderWidth: S.px,
  },
  primary: {
    backgroundColor: Colors.ledger,
    borderColor: Colors.ledger,
  },
  secondary: {
    backgroundColor: Colors.surfaceRaised,
    borderColor: Colors.slate,
  },
  danger: {
    backgroundColor: Colors.oxblood,
    borderColor: Colors.oxblood,
  },
  ghost: {
    backgroundColor: 'transparent',
    borderColor: Colors.slate,
  },
  pressed: {
    opacity: 0.82,
  },
  disabled: {
    opacity: 0.45,
  },
  content: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: S.sm,
  },
  label: {
    fontFamily: F.family.bodySemi,
    fontSize: F.size.base,
  },
  primaryLabel: {
    color: Colors.dossier,
  },
  defaultLabel: {
    color: Colors.dossier,
  },
});
