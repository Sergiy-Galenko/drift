import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';

import {
  ActivityIcon,
  CreateIcon,
  ExploreIcon,
  HomeIcon,
  ProfileIcon,
  type AppIcon,
} from '@/components/icons';
import { Colors, F, R, S } from '@/constants/tokens';
import { useNotifications } from '@/hooks/useNotifications';

const icons: Record<string, AppIcon> = {
  feed: HomeIcon,
  explore: ExploreIcon,
  create: CreateIcon,
  activity: ActivityIcon,
  profile: ProfileIcon,
};

const labels: Record<string, string> = {
  feed: 'Feed',
  explore: 'Explore',
  create: 'Create',
  activity: 'Activity',
  profile: 'Profile',
};

export function TabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const { unreadCount } = useNotifications();

  return (
    <View style={styles.wrap}>
      {state.routes.map((route, index) => {
        const focused = state.index === index;
        const options = descriptors[route.key]?.options;
        const Icon = icons[route.name] ?? HomeIcon;
        const label = labels[route.name] ?? String(options?.title ?? route.name);
        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!focused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        };

        return (
          <Pressable key={route.key} onPress={onPress} style={[styles.item, focused ? styles.activeItem : null]}>
            <Icon size={22} color={focused ? Colors.accentVolt : Colors.textMuted} />
            <Text style={[styles.label, focused ? styles.activeLabel : null]}>{label}</Text>
            {route.name === 'activity' && unreadCount > 0 ? (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
              </View>
            ) : null}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    borderTopWidth: S.px,
    borderTopColor: Colors.stroke,
    backgroundColor: Colors.bgBase,
    paddingHorizontal: S.sm,
    paddingTop: S.sm,
    paddingBottom: S.lg,
  },
  item: {
    flex: 1,
    minHeight: S.x6,
    alignItems: 'center',
    justifyContent: 'center',
    gap: S.xs,
    borderRadius: R.md,
  },
  activeItem: {
    backgroundColor: Colors.bgSurface,
  },
  label: {
    color: Colors.textMuted,
    fontFamily: F.family.monoBold,
    fontSize: F.size.micro,
    textTransform: 'uppercase',
  },
  activeLabel: {
    color: Colors.accentVolt,
  },
  badge: {
    position: 'absolute',
    top: S.xs,
    right: S.md,
    minWidth: S.xl,
    height: S.xl,
    borderRadius: R.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.accentFire,
  },
  badgeText: {
    color: Colors.textPrimary,
    fontFamily: F.family.monoBold,
    fontSize: F.size.micro,
  },
});
