import type { ReactNode } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  type GestureResponderEvent,
  type PressableStateCallbackType,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { colors } from '@/constants/colors';
import { fontFamily, radius } from '@/constants/typography';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'ice';

type ButtonProps = {
  label: string;
  onPress?: (event: GestureResponderEvent) => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  leftIcon?: ReactNode;
  style?: StyleProp<ViewStyle>;
};

function variantStyle(variant: ButtonVariant, disabled?: boolean) {
  if (disabled) {
    return {
      backgroundColor: colors.elevated,
      borderColor: colors.stroke,
      color: colors.textMuted,
    };
  }

  switch (variant) {
    case 'primary':
      return { backgroundColor: colors.volt, borderColor: colors.volt, color: colors.base };
    case 'danger':
      return { backgroundColor: colors.fire, borderColor: colors.fire, color: colors.base };
    case 'ice':
      return { backgroundColor: colors.ice, borderColor: colors.ice, color: colors.base };
    case 'ghost':
      return { backgroundColor: 'transparent', borderColor: colors.stroke, color: colors.textPrimary };
    case 'secondary':
    default:
      return { backgroundColor: colors.elevated, borderColor: colors.stroke, color: colors.textPrimary };
  }
}

export function Button({
  label,
  onPress,
  variant = 'secondary',
  disabled,
  loading,
  fullWidth,
  leftIcon,
  style,
}: ButtonProps) {
  const stylesForVariant = variantStyle(variant, disabled || loading);

  const pressableStyle = ({ pressed }: PressableStateCallbackType): StyleProp<ViewStyle> => {
    const dynamicStyle: ViewStyle = {
      backgroundColor: stylesForVariant.backgroundColor,
      borderColor: stylesForVariant.borderColor,
      alignSelf: fullWidth ? 'stretch' : 'flex-start',
      transform: [{ scale: pressed ? 0.95 : 1 }],
    };

    return [styles.button, dynamicStyle, style];
  };

  return (
    <Pressable
      disabled={disabled || loading}
      onPress={onPress}
      style={pressableStyle}
    >
      {loading ? <ActivityIndicator color={stylesForVariant.color} /> : leftIcon}
      <Text style={[styles.label, { color: stylesForVariant.color }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 48,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: 18,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  label: {
    fontFamily: fontFamily.bodySemiBold,
    fontSize: 14,
    letterSpacing: 0,
  },
});
