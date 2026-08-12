import { Stack } from 'expo-router';

import { Colors } from '@/constants/tokens';

export default function DossierLayout() {
  return <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: Colors.wall }, animation: 'slide_from_right' }} />;
}
