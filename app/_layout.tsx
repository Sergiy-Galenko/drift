import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { Toast } from '@/components/ui/Toast';
import { fontMap } from '@/constants/fonts';
import { Colors } from '@/constants/tokens';
import { useRouletteSync } from '@/features/roulette/store/useRouletteStore';
import { useAuthBootstrap } from '@/hooks/useAuth';
import '@/lib/firebase/config';
import { useAuthStore } from '@/stores/authStore';

void SplashScreen.preventAutoHideAsync().catch(() => undefined);

export default function RootLayout() {
  useAuthBootstrap();
  const profile = useAuthStore((state) => state.profile);
  useRouletteSync(profile);
  const [fontsLoaded] = useFonts(fontMap);

  useEffect(() => {
    if (fontsLoaded) {
      void SplashScreen.hideAsync().catch(() => undefined);
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: Colors.bgBase }}>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: Colors.bgBase },
          animation: 'fade',
        }}
      >
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="(drift)" />
        <Stack.Screen name="(chat)" />
        <Stack.Screen name="(user)" />
        <Stack.Screen name="(roulette)" />
        <Stack.Screen name="profile" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="search" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="(modals)" options={{ presentation: 'modal' }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      <Toast />
    </GestureHandlerRootView>
  );
}
