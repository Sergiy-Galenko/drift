import { Redirect, Tabs } from 'expo-router';

import { TabBar } from '@/components/navigation/TabBar';
import { Spinner } from '@/components/ui/Spinner';
import { useAuthStore } from '@/stores/authStore';

export default function TabsLayout() {
  const profile = useAuthStore((state) => state.profile);
  const initialized = useAuthStore((state) => state.initialized);
  const loading = useAuthStore((state) => state.loading);

  if (!initialized || loading) {
    return <Spinner label="Loading account" />;
  }

  if (!profile) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <Tabs tabBar={(props) => <TabBar {...props} />} screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="feed" />
      <Tabs.Screen name="explore" />
      <Tabs.Screen name="create" />
      <Tabs.Screen name="activity" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}
