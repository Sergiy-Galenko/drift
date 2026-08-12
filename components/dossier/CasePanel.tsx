import type { PropsWithChildren } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { Colors, R, S } from '@/constants/tokens';

type CasePanelProps = PropsWithChildren<{ style?: StyleProp<ViewStyle> }>;

export function CasePanel({ children, style }: CasePanelProps) {
  return <View style={[styles.panel, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  panel: {
    borderWidth: S.px,
    borderColor: Colors.paperLine,
    borderRadius: R.md,
    backgroundColor: Colors.dossier,
    padding: S.lg,
  },
});
