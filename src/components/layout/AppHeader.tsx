import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors } from '@/constants/colors';
import { fontFamily } from '@/constants/typography';

type AppHeaderProps = {
  title: string;
  eyebrow?: string;
  action?: ReactNode;
};

export function AppHeader({ title, eyebrow, action }: AppHeaderProps) {
  return (
    <View style={styles.wrap}>
      <View style={styles.titleWrap}>
        {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
        <Text style={styles.title}>{title}</Text>
      </View>
      {action}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingBottom: 18,
  },
  titleWrap: {
    flex: 1,
    gap: 4,
  },
  eyebrow: {
    color: colors.textMuted,
    fontFamily: fontFamily.monoBold,
    fontSize: 11,
  },
  title: {
    color: colors.textPrimary,
    fontFamily: fontFamily.displayBold,
    fontSize: 30,
    letterSpacing: 0,
  },
});
