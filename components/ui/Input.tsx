import { forwardRef, type ReactNode } from 'react';
import { StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';

import { Colors, F, R, S } from '@/constants/tokens';

type InputProps = TextInputProps & {
  label?: string;
  error?: string | null;
  right?: ReactNode;
};

export const Input = forwardRef<TextInput, InputProps>(function Input({ label, error, right, style, ...props }, ref) {
  return (
    <View style={styles.wrap}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={styles.inputArea}>
        <TextInput
          ref={ref}
          placeholderTextColor={Colors.textMuted}
          selectionColor={Colors.blue}
          style={[styles.input, right ? styles.inputWithRight : null, error ? styles.errorInput : null, style]}
          {...props}
        />
        {right ? <View style={styles.right}>{right}</View> : null}
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
});

const styles = StyleSheet.create({
  wrap: {
    gap: S.sm,
  },
  label: {
    color: Colors.textSecondary,
    fontFamily: F.family.monoBold,
    fontSize: F.size.xs,
    textTransform: 'uppercase',
  },
  inputArea: {
    position: 'relative',
  },
  input: {
    minHeight: S.x6,
    borderRadius: R.sm,
    borderWidth: S.px,
    borderColor: Colors.strokeStrong,
    backgroundColor: Colors.surfaceRaised,
    color: Colors.textPrimary,
    fontFamily: F.family.bodyRegular,
    fontSize: F.size.base,
    paddingHorizontal: S.lg,
    paddingVertical: S.md,
  },
  inputWithRight: {
    paddingRight: S.x7,
  },
  right: {
    position: 'absolute',
    top: 0,
    right: S.xs,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorInput: {
    borderColor: Colors.fire,
  },
  error: {
    color: Colors.fire,
    fontFamily: F.family.bodyMedium,
    fontSize: F.size.sm,
  },
});
