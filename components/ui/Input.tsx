import { StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';

import { Colors, F, R, S } from '@/constants/tokens';

type InputProps = TextInputProps & {
  label?: string;
  error?: string | null;
};

export function Input({ label, error, style, ...props }: InputProps) {
  return (
    <View style={styles.wrap}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TextInput
        placeholderTextColor={Colors.textMuted}
        selectionColor={Colors.blue}
        style={[styles.input, error ? styles.errorInput : null, style]}
        {...props}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

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
  errorInput: {
    borderColor: Colors.fire,
  },
  error: {
    color: Colors.fire,
    fontFamily: F.family.bodyMedium,
    fontSize: F.size.sm,
  },
});
