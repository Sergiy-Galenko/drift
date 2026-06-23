import { Redirect } from 'expo-router';

import { Spinner } from '@/components/ui/Spinner';
import { useAuthStore } from '@/stores/authStore';

export default function IndexScreen() {
  const profile = useAuthStore((state) => state.profile);
  const initialized = useAuthStore((state) => state.initialized);
  const loading = useAuthStore((state) => state.loading);

  if (!initialized || loading) {
    return <Spinner label="Starting DRIFT" />;
  }

  return <Redirect href={profile ? '/(tabs)/feed' : '/(auth)/login'} />;
}
