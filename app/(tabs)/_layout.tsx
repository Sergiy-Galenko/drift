import { Redirect, Tabs } from 'expo-router';

import { TabBar } from '@/components/navigation/TabBar';
import { Spinner } from '@/components/ui/Spinner';
import { useAuthStore } from '@/stores/authStore';

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
    <Tabs tabBar={(props) => <TabBar {...props} />} screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="index" />
      <Tabs.Screen name="explore" />
      <Tabs.Screen name="create" />
      <Tabs.Screen name="reels" />
      <Tabs.Screen name="profile" />
      <Tabs.Screen name="feed" options={{ href: null }} />
      <Tabs.Screen name="activity" options={{ href: null }} />
    </Tabs>
  );
}
