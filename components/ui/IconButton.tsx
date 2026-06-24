import { Pressable, StyleSheet } from 'react-native';

import type { AppIcon } from '@/components/icons';
import { Colors, R, S } from '@/constants/tokens';

type IconButtonProps = {
  icon: AppIcon;
  onPress?: () => void;
  label: string;
  active?: boolean;
  disabled?: boolean;
};

export function IconButton({ icon: Icon, onPress, label, active = false, disabled = false }: IconButtonProps) {
  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        active ? styles.active : null,
        disabled ? styles.disabled : null,
        pressed && !disabled ? styles.pressed : null,
      ]}
    >
      <Icon size={20} color={active ? Colors.blue : Colors.textPrimary} filled={active} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: S.x5,
    height: S.x5,
    borderRadius: R.pill,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  active: {
    backgroundColor: 'transparent',
  },
  disabled: {
    opacity: 0.4,
  },
  pressed: {
    opacity: 0.78,
  },
});
