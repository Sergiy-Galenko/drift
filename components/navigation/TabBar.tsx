import { Pressable, StyleSheet, View } from 'react-native';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useRouter } from 'expo-router';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  ActivityIcon,
  CreateIcon,
  HomeIcon,
  ProfileIcon,
  SearchIcon,
  type AppIcon,
} from '@/components/icons';
import { Colors, Motion, R, S } from '@/constants/tokens';
import { useHaptics } from '@/hooks/useHaptics';
import { useNotificationsContext } from '@/hooks/useNotifications';

const VISIBLE_TABS: {
  routeName: 'index' | 'activity' | 'profile';
  label: string;
  icon: AppIcon;
}[] = [
  { routeName: 'index', label: 'Feed', icon: HomeIcon },
  { routeName: 'activity', label: 'Activity', icon: ActivityIcon },
  { routeName: 'profile', label: 'Profile', icon: ProfileIcon },
];

type TabButtonProps = {
  routeName?: string;
  label: string;
  icon: AppIcon;
  focused: boolean;
  unreadCount?: number;
  fab?: boolean;
  onPress: () => void;
};

function TabButton({ routeName, label, icon: Icon, focused, unreadCount = 0, fab = false, onPress }: TabButtonProps) {
  const scale = useSharedValue(1);
  const haptics = useHaptics();

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const press = () => {
    haptics.selection();
    onPress();
  };

  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      onPress={press}
      onPressIn={() => {
        scale.value = withSpring(fab ? 0.94 : 0.88, Motion.spring.responsive);
      }}
      onPressOut={() => {
        scale.value = withSpring(1, Motion.spring.responsive);
      }}
      style={[styles.item, fab ? styles.fabItem : null]}
    >
      <Animated.View style={[fab ? styles.fabWrap : styles.iconWrap, animatedStyle]}>
        <Icon size={fab ? 24 : 23} color={fab ? Colors.black : Colors.white} filled={focused} />
        {routeName === 'activity' && unreadCount > 0 ? <View style={styles.dot} /> : null}
      </Animated.View>
    </Pressable>
  );
}

export function TabBar({ state, navigation }: BottomTabBarProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { unreadCount } = useNotificationsContext();
  const focusedRouteName = state.routes[state.index]?.name;

  return (
    <View style={[styles.wrap, { height: 58 + insets.bottom, paddingBottom: insets.bottom }]}>
      {VISIBLE_TABS.slice(0, 1).map((tab) => {
        const route = state.routes.find((item) => item.name === tab.routeName);
        const focused = focusedRouteName === tab.routeName;
        const routeKey = route?.key;
        const routeIndex = route ? state.routes.findIndex((item) => item.key === route.key) : -1;

        const onPress = () => {
          if (!routeKey || routeIndex < 0) {
            return;
          }

          const event = navigation.emit({
            type: 'tabPress',
            target: routeKey,
            canPreventDefault: true,
          });

          if (!focused && !event.defaultPrevented) {
            navigation.navigate(tab.routeName);
          }
        };

        return (
          <TabButton
            key={tab.routeName}
            routeName={tab.routeName}
            label={tab.label}
            icon={tab.icon}
            focused={focused}
            unreadCount={tab.routeName === 'activity' ? unreadCount : 0}
            onPress={onPress}
          />
        );
      })}
      <TabButton
        label="Search people and posts"
        icon={SearchIcon}
        focused={false}
        onPress={() => router.push('/search')}
      />
      <TabButton
        label="Create drift"
        icon={CreateIcon}
        focused={false}
        fab
        onPress={() => router.push('/(modals)/create')}
      />
      {VISIBLE_TABS.slice(1).map((tab) => {
        const route = state.routes.find((item) => item.name === tab.routeName);
        const focused = focusedRouteName === tab.routeName;
        const routeKey = route?.key;
        const routeIndex = route ? state.routes.findIndex((item) => item.key === route.key) : -1;

        const onPress = () => {
          if (!routeKey || routeIndex < 0) {
            return;
          }

          const event = navigation.emit({
            type: 'tabPress',
            target: routeKey,
            canPreventDefault: true,
          });

          if (!focused && !event.defaultPrevented) {
            navigation.navigate(tab.routeName);
          }
        };

        return (
          <TabButton
            key={tab.routeName}
            routeName={tab.routeName}
            label={tab.label}
            icon={tab.icon}
            focused={focused}
            unreadCount={tab.routeName === 'activity' ? unreadCount : 0}
            onPress={onPress}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    borderTopWidth: S.px,
    borderTopColor: Colors.separator,
    backgroundColor: Colors.black,
    paddingHorizontal: S.md,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  item: {
    width: 72,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fabItem: {
    width: 84,
  },
  iconWrap: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fabWrap: {
    width: 52,
    height: 52,
    borderRadius: R.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
  },
  dot: {
    position: 'absolute',
    top: 4,
    right: 3,
    width: 8,
    height: 8,
    borderRadius: R.pill,
    backgroundColor: Colors.fire,
  },
});
