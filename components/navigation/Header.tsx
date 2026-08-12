import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { LocalizedText as Text } from '@/components/ui/LocalizedText';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BackButton } from './BackButton';
import { Colors, F, S } from '@/constants/tokens';
import { useTranslation } from '@/hooks/useTranslation';

type HeaderProps = {
  title: string;
  showBack?: boolean;
  right?: ReactNode;
};

export function Header({ title, showBack = false, right }: HeaderProps) {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  return (
    <View style={[styles.wrap, { paddingTop: insets.top + S.md }]}>
      <View style={styles.side}>{showBack ? <BackButton /> : null}</View>
      <Text numberOfLines={1} style={styles.title}>{t(title)}</Text>
      <View style={styles.side}>{right}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    minHeight: 44,
    paddingHorizontal: S.md,
    paddingBottom: S.sm,
    borderBottomWidth: S.px,
    borderBottomColor: Colors.separator,
    backgroundColor: Colors.wall,
    flexDirection: 'row',
    alignItems: 'center',
    gap: S.sm,
  },
  side: {
    minWidth: S.x4,
    flexShrink: 0,
    alignItems: 'center',
  },
  title: {
    flex: 1,
    color: Colors.textPrimary,
    fontFamily: F.family.displayBold,
    fontSize: F.size.lg,
    letterSpacing: 0.7,
    textAlign: 'center',
  },
});
