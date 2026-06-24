import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Spinner } from './Spinner';
import { Colors, F, R, S } from '@/constants/tokens';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';

type ButtonProps = {
  label: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  loading?: boolean;
  icon?: ReactNode;
};

export function Button({ label, onPress, variant = 'primary', disabled = false, loading = false, icon }: ButtonProps) {
  const isDisabled = disabled || loading;
  return (
    <Pressable
      accessibilityRole="button"
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
        <Spinner label={label} />
      ) : (
        <View style={styles.content}>
          {icon}
          <Text style={[styles.label, variant === 'primary' ? styles.primaryLabel : styles.defaultLabel]}>{label}</Text>
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
    backgroundColor: Colors.blue,
    borderColor: Colors.blue,
  },
  secondary: {
    backgroundColor: Colors.bgInteractive,
    borderColor: Colors.strokeStrong,
  },
  danger: {
    backgroundColor: Colors.accentFire,
    borderColor: Colors.accentFire,
  },
  ghost: {
    backgroundColor: 'transparent',
    borderColor: Colors.stroke,
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
    color: Colors.white,
  },
  defaultLabel: {
    color: Colors.textPrimary,
  },
});
