import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { PaperPlaneIcon } from '@/components/icons';
import { Colors, R, S } from '@/constants/tokens';

type ChatInputProps = {
  value: string;
  onChangeText: (text: string) => void;
  onSend: () => void;
  disabled?: boolean;
};

export function ChatInput({ value, onChangeText, onSend, disabled = false }: ChatInputProps) {
  return (
    <View style={styles.wrap}>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder="Write a message..."
        placeholderTextColor={Colors.textPlaceholder}
        editable={!disabled}
        style={styles.input}
        multiline
      />
      <Pressable disabled={disabled || !value.trim()} onPress={onSend} style={styles.send}>
        <PaperPlaneIcon size={20} color={disabled || !value.trim() ? Colors.textTertiary : Colors.blue} filled />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: S.sm,
    paddingHorizontal: S.md,
    paddingVertical: S.sm,
    borderTopWidth: S.px,
    borderTopColor: Colors.separator,
    backgroundColor: Colors.black,
  },
  input: {
    flex: 1,
    maxHeight: 120,
    paddingHorizontal: S.md,
    paddingVertical: S.sm,
    borderRadius: R.pill,
    backgroundColor: Colors.surfaceRaised,
    color: Colors.textPrimary,
  },
  send: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
