import { forwardRef, type ReactNode } from 'react';
import { StyleSheet, TextInput, View, type TextInputProps } from 'react-native';
import { LocalizedText as Text } from '@/components/ui/LocalizedText';

import { Colors, F, R, S } from '@/constants/tokens';
import { useTranslation } from '@/hooks/useTranslation';

type InputProps = TextInputProps & {
  label?: string;
  error?: string | null;
  right?: ReactNode;
};

function inputTestId(label?: string): string | undefined {
  return label ? `input-${label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}` : undefined;
}

export const Input = forwardRef<TextInput, InputProps>(function Input({ label, error, right, style, placeholder, ...props }, ref) {
  const { t } = useTranslation();
  return (
    <View style={styles.wrap}>
      {label ? <Text style={styles.label}>{t(label)}</Text> : null}
      <View style={styles.inputArea}>
        <TextInput
          ref={ref}
          testID={props.testID ?? inputTestId(label)}
          accessibilityLabel={props.accessibilityLabel ?? (label ? t(label) : undefined)}
          placeholder={placeholder ? t(placeholder) : undefined}
          placeholderTextColor={Colors.slate}
          selectionColor={Colors.ledger}
          style={[styles.input, right ? styles.inputWithRight : null, error ? styles.errorInput : null, style]}
          {...props}
        />
        {right ? <View style={styles.right}>{right}</View> : null}
      </View>
      {error ? <Text style={styles.error}>{t(error)}</Text> : null}
    </View>
  );
});

const styles = StyleSheet.create({
  wrap: {
    gap: S.sm,
  },
  label: {
    color: Colors.dossier,
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
    color: Colors.dossier,
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
    borderColor: Colors.oxblood,
  },
  error: {
    color: Colors.oxblood,
    fontFamily: F.family.bodyMedium,
    fontSize: F.size.sm,
  },
});
