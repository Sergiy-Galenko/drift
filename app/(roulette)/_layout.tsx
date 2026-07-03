import { Stack } from 'expo-router';

import { Colors } from '@/constants/tokens';

export default function RouletteLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: Colors.bgBase },
        animation: 'slide_from_right',
      }}
    />
  );
}
