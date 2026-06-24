import type { ReactNode } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';

import { Colors, R, S, Shadows } from '@/constants/tokens';

type BottomSheetProps = {
  visible: boolean;
  onClose: () => void;
  children: ReactNode;
};

export function BottomSheet({ visible, onClose, children }: BottomSheetProps) {
  return (
    <Modal transparent visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.root}>
        <Pressable accessibilityLabel="Close sheet" style={styles.backdrop} onPress={onClose} />
        <View style={styles.sheet}>
          <View style={styles.handle} />
          {children}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.overlay,
  },
  sheet: {
    backgroundColor: Colors.surfaceSheet,
    borderTopLeftRadius: R.xl,
    borderTopRightRadius: R.xl,
    borderTopWidth: S.px,
    borderColor: Colors.separatorStrong,
    padding: S.x2,
    gap: S.lg,
    ...Shadows.modal,
  },
  handle: {
    width: S.x5,
    height: S.xs,
    borderRadius: R.pill,
    backgroundColor: Colors.strokeStrong,
    alignSelf: 'center',
  },
});
