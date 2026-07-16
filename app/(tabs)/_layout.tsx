import { Redirect, Tabs } from 'expo-router';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';

import { TabBar } from '@/components/navigation/TabBar';
import { Spinner } from '@/components/ui/Spinner';
import { NotificationsProvider } from '@/hooks/useNotifications';
import { useAuthStore } from '@/stores/authStore';

function renderTabBar(props: BottomTabBarProps) {
  return <TabBar {...props} />;
}

export default function TabsLayout() {
  const profile = useAuthStore((state) => state.profile);
  const initialized = useAuthStore((state) => state.initialized);

  if (!initialized) {
    return <Spinner label="Loading account" />;
  }

  if (!profile) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <NotificationsProvider>
      <Tabs tabBar={renderTabBar} screenOptions={{ headerShown: false }}>
        <Tabs.Screen name="index" />
        <Tabs.Screen name="activity" />
        <Tabs.Screen name="create" options={{ href: null }} />
        <Tabs.Screen name="profile" options={{ href: null }} />
        <Tabs.Screen name="feed" options={{ href: null }} />
        <Tabs.Screen name="explore" options={{ href: null }} />
        <Tabs.Screen name="reels" options={{ href: null }} />
      </Tabs>
    </NotificationsProvider>
  );
}
