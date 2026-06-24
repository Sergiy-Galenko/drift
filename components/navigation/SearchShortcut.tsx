import { useRouter } from 'expo-router';

import { SearchIcon } from '@/components/icons';
import { IconButton } from '@/components/ui/IconButton';

export function SearchShortcut() {
  const router = useRouter();

  return <IconButton icon={SearchIcon} label="Search people and posts" onPress={() => router.push('/search')} />;
}
