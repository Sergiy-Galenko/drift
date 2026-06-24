import { Image, Pressable, StyleSheet, View } from 'react-native';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  CreateIcon,
  ExploreIcon,
  HomeIcon,
  ReelsIcon,
  ProfileIcon,
  type AppIcon,
} from '@/components/icons';
import { Colors, Motion, R, S } from '@/constants/tokens';
import { useHaptics } from '@/hooks/useHaptics';
import { useNotifications } from '@/hooks/useNotifications';
import { useAuthStore } from '@/stores/authStore';

const icons: Record<string, AppIcon> = {
  index: HomeIcon,
  explore: ExploreIcon,
  create: CreateIcon,
  reels: ReelsIcon,
  profile: ProfileIcon,
};

type TabButtonProps = {
  routeName: string;
  focused: boolean;
  unreadCount: number;
  onPress: () => void;
};

function TabButton({ routeName, focused, unreadCount, onPress }: TabButtonProps) {
  const scale = useSharedValue(1);
  const haptics = useHaptics();
  const profile = useAuthStore((state) => state.profile);
  const Icon = icons[routeName] ?? HomeIcon;

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const press = () => {
    haptics.selection();
    onPress();
  };

  return (
    <Pressable
      accessibilityLabel={routeName}
      accessibilityRole="button"
      onPress={press}
      onPressIn={() => {
        scale.value = withSpring(0.88, Motion.spring.responsive);
      }}
      onPressOut={() => {
        scale.value = withSpring(1, Motion.spring.responsive);
      }}
      style={styles.item}
    >
      <Animated.View style={[styles.iconWrap, animatedStyle]}>
        {routeName === 'profile' && profile?.avatarUrl ? (
          <View style={[styles.profileAvatar, focused ? styles.profileAvatarActive : null]}>
            <Image source={{ uri: profile.avatarUrl }} style={styles.profileImage} />
          </View>
        ) : (
          <Icon size={routeName === 'create' ? 26 : 24} color={Colors.white} filled={focused} />
        )}
        {routeName === 'reels' && unreadCount > 0 ? <View style={styles.dot} /> : null}
      </Animated.View>
    </Pressable>
  );
}

export function TabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const { unreadCount } = useNotifications();

  return (
    <View style={[styles.wrap, { height: 49 + insets.bottom, paddingBottom: insets.bottom }]}>
      {state.routes.map((route, index) => {
        const focused = state.index === index;
        const options = descriptors[route.key]?.options;
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
          <TabButton
            key={route.key}
            routeName={String(options?.title ?? route.name)}
            focused={focused}
            unreadCount={unreadCount}
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
    paddingHorizontal: S.xs,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrap: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
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
  profileAvatar: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: S.px,
    borderColor: Colors.separatorStrong,
    overflow: 'hidden',
  },
  profileAvatarActive: {
    borderWidth: 2,
    borderColor: Colors.white,
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
});
