import { Redirect } from 'expo-router';

import { Spinner } from '@/components/ui/Spinner';
import { useAuthStore } from '@/stores/authStore';

export default function IndexScreen() {
  const profile = useAuthStore((state) => state.profile);
  const initialized = useAuthStore((state) => state.initialized);

  if (!initialized) {
    return <Spinner label="Starting DRIFT" />;
  }

  return <Redirect href={profile ? '/(tabs)' : '/(auth)/login'} />;
}
