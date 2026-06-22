import { forwardRef } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from 'react-native';

import { colors } from '@/constants/colors';
import { fontFamily, radius } from '@/constants/typography';

type TextFieldProps = TextInputProps & {
  label?: string;
  error?: string;
  counter?: string;
  dangerCounter?: boolean;
};

export const TextField = forwardRef<TextInput, TextFieldProps>(function TextField(
  { label, error, counter, dangerCounter, style, ...props },
  ref,
) {
  return (
    <View style={styles.wrap}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TextInput
        ref={ref}
        placeholderTextColor={colors.textGhost}
        selectionColor={colors.volt}
        style={[styles.input, props.multiline ? styles.multiline : null, style]}
        {...props}
      />
      <View style={styles.metaRow}>
        {error ? <Text style={styles.error}>{error}</Text> : <View />}
        {counter ? <Text style={[styles.counter, dangerCounter ? styles.counterDanger : null]}>{counter}</Text> : null}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  wrap: {
    gap: 8,
  },
  label: {
    color: colors.textPrimary,
    fontFamily: fontFamily.bodySemiBold,
    fontSize: 13,
  },
  input: {
    minHeight: 50,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.stroke,
    backgroundColor: colors.surface,
    color: colors.textPrimary,
    fontFamily: fontFamily.body,
    fontSize: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  multiline: {
    minHeight: 150,
    textAlignVertical: 'top',
  },
  metaRow: {
    minHeight: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  error: {
    flex: 1,
    color: colors.fire,
    fontFamily: fontFamily.bodyMedium,
    fontSize: 12,
  },
  counter: {
    color: colors.textMuted,
    fontFamily: fontFamily.mono,
    fontSize: 12,
  },
  counterDanger: {
    color: colors.fire,
  },
});
