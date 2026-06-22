import type { ReactNode } from 'react';
import { Modal as NativeModal, Pressable, StyleSheet } from 'react-native';
import Animated, { FadeIn, FadeOut, ZoomIn, ZoomOut } from 'react-native-reanimated';

import { colors } from '@/constants/colors';
import { radius } from '@/constants/typography';

type ModalProps = {
  visible: boolean;
  onClose?: () => void;
  children: ReactNode;
};

export function Modal({ visible, onClose, children }: ModalProps) {
  return (
    <NativeModal animationType="none" transparent visible={visible} onRequestClose={onClose}>
      <Animated.View entering={FadeIn.duration(150)} exiting={FadeOut.duration(120)} style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <Animated.View entering={ZoomIn.duration(160)} exiting={ZoomOut.duration(120)} style={styles.card}>
          {children}
        </Animated.View>
      </Animated.View>
    </NativeModal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(13, 13, 13, 0.86)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.stroke,
    backgroundColor: colors.surface,
    padding: 18,
  },
});
