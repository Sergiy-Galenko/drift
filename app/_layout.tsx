import '../global.css';

import { useEffect } from 'react';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold } from '@expo-google-fonts/inter';
import { JetBrainsMono_600SemiBold, JetBrainsMono_700Bold } from '@expo-google-fonts/jetbrains-mono';
import { SpaceGrotesk_700Bold } from '@expo-google-fonts/space-grotesk';

import { colors } from '@/constants/colors';
import { useAuthBootstrap } from '@/hooks/useAuth';

void SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useAuthBootstrap();

  const [fontsLoaded] = useFonts({
    SpaceGrotesk: SpaceGrotesk_700Bold,
    SpaceGroteskBold: SpaceGrotesk_700Bold,
    Inter: Inter_400Regular,
    InterMedium: Inter_500Medium,
    InterSemiBold: Inter_600SemiBold,
    JetBrainsMono: JetBrainsMono_600SemiBold,
    JetBrainsMonoBold: JetBrainsMono_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded) {
      void SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.base },
          animation: 'fade',
          animationDuration: 150,
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="auth" />
        <Stack.Screen name="feed" />
        <Stack.Screen name="create" />
        <Stack.Screen name="profile" />
        <Stack.Screen name="alerts" />
        <Stack.Screen name="drift/[id]" />
        <Stack.Screen
          name="modal/proof-upload"
          options={{
            presentation: 'modal',
          }}
        />
      </Stack>
    </>
  );
}
