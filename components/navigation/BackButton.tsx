import { useRouter } from 'expo-router';

import { BackIcon } from '@/components/icons';
import { IconButton } from '@/components/ui/IconButton';

export function BackButton() {
  const router = useRouter();
  return <IconButton icon={BackIcon} label="Go back" onPress={() => router.back()} />;
}
