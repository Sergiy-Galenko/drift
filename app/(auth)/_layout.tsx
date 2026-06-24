import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Redirect, Stack } from 'expo-router';

import { Spinner } from '@/components/ui/Spinner';
import { useAuthStore } from '@/stores/authStore';

export default function AuthLayout() {
  const profile = useAuthStore((state) => state.profile);
  const initialized = useAuthStore((state) => state.initialized);
  const [onboarded, setOnboarded] = useState<boolean | null>(null);

  useEffect(() => {
    AsyncStorage.getItem('drift_onboarding_v1')
      .then((value) => setOnboarded(value === 'done'))
      .catch(() => setOnboarded(false));
  }, []);

  if (!initialized || onboarded === null) {
    return <Spinner label="Starting DRIFT" />;
  }

  if (profile) {
    return <Redirect href="/(tabs)" />;
  }

  const screenOrder = onboarded ? ['login', 'welcome', 'onboarding'] : ['onboarding', 'login', 'welcome'];

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {screenOrder.map((name) => (
        <Stack.Screen key={name} name={name} />
      ))}
    </Stack>
  );
}
