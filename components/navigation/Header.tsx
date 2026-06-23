import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BackButton } from './BackButton';
import { Colors, F, S } from '@/constants/tokens';

type HeaderProps = {
  title: string;
  showBack?: boolean;
  right?: ReactNode;
};

export function Header({ title, showBack = false, right }: HeaderProps) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.wrap, { paddingTop: insets.top + S.md }]}>
      <View style={styles.side}>{showBack ? <BackButton /> : null}</View>
      <Text numberOfLines={1} style={styles.title}>{title}</Text>
      <View style={styles.side}>{right}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    minHeight: S.x8,
    paddingHorizontal: S.lg,
    paddingBottom: S.md,
    borderBottomWidth: S.px,
    borderBottomColor: Colors.stroke,
    backgroundColor: Colors.bgBase,
    flexDirection: 'row',
    alignItems: 'center',
    gap: S.md,
  },
  side: {
    width: S.x5,
    alignItems: 'center',
  },
  title: {
    flex: 1,
    color: Colors.textPrimary,
    fontFamily: F.family.displayBold,
    fontSize: F.size.lg,
    textAlign: 'center',
  },
});
