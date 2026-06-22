import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Bell, Home, Plus, User } from 'lucide-react-native';
import { usePathname, useRouter, type Href } from 'expo-router';

import { colors } from '@/constants/colors';
import { fontFamily } from '@/constants/typography';

type TabItem = {
  label: string;
  href: Href;
  Icon: typeof Home;
  create?: boolean;
};

const tabs: TabItem[] = [
  { label: 'Feed', href: '/feed', Icon: Home },
  { label: 'Create', href: '/create', Icon: Plus, create: true },
  { label: 'Profile', href: '/profile', Icon: User },
  { label: 'Alerts', href: '/alerts', Icon: Bell },
];

export function BottomTabs() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <View style={styles.wrap}>
      {tabs.map((tab) => {
        const active = pathname === tab.href;
        const color = active ? colors.volt : colors.textMuted;

        return (
          <Pressable
            key={tab.label}
            onPress={() => router.push(tab.href)}
            style={[styles.item, tab.create ? styles.createItem : null]}
          >
            <View style={[tab.create ? styles.createCircle : styles.iconWrap, tab.create && active ? styles.activeCreate : null]}>
              <tab.Icon size={tab.create ? 24 : 20} color={tab.create ? colors.base : color} strokeWidth={2.2} />
            </View>
            {!tab.create ? <Text style={[styles.label, { color }]}>{tab.label}</Text> : null}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderColor: colors.stroke,
    backgroundColor: colors.base,
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 8,
  },
  item: {
    minWidth: 62,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  createItem: {
    transform: [{ translateY: -2 }],
  },
  iconWrap: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  createCircle: {
    width: 48,
    height: 48,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.volt,
    borderWidth: 1,
    borderColor: colors.volt,
  },
  activeCreate: {
    backgroundColor: colors.ice,
    borderColor: colors.ice,
  },
  label: {
    fontFamily: fontFamily.monoBold,
    fontSize: 10,
  },
});
