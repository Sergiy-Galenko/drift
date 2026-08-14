import { StyleSheet, View } from 'react-native';
import { LocalizedText as Text } from '@/components/ui/LocalizedText';
import { Image } from 'expo-image';

import { ReputationRing } from '@/components/drift/ReputationRing';
import { Colors, F, S } from '@/constants/tokens';

type AvatarProps = {
  username: string;
  avatarUrl: string | null;
  reputationScore?: number;
  size?: number;
  showReputationRing?: boolean;
};

const AVATAR_COLORS = ['#FF6666', '#A72BF0', '#66FF66', '#ff9204', '#38F3F3', '#FFF444', '#eda5f0', '#0400FF'] as const;

const getColorFromUsername = (username: string): string => {
  const hash = username.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
};

const getFirstLetter = (username: string): string => {
  if (!username.trim()) return '?';
  return username.trim().charAt(0).toUpperCase();
};

export function Avatar({ username, avatarUrl, reputationScore = 50, size = 44, showReputationRing = true }: AvatarProps) {
  const initial = getFirstLetter(username);
  const backgroundColor = getColorFromUsername(username);
  return (
    <View style={styles.wrap}>
      {showReputationRing ? <ReputationRing score={reputationScore} size={size + S.sm} strokeWidth={2} /> : null}
      <View style={[styles.avatar, { width: size, height: size, borderRadius: size / 2, backgroundColor }]}>
        {avatarUrl ? (
          <Image
            source={avatarUrl}
            style={styles.image}
            cachePolicy="memory-disk"
            contentFit="cover"
            transition={120}
          />
        ) : (
          <Text style={styles.initial}>{initial}</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: {
    position: 'absolute',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surfaceRaised,
    borderWidth: S.px,
    borderColor: Colors.slate,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  initial: {
    color: Colors.dossier,
    fontFamily: F.family.displayBold,
    fontSize: F.size.md,
  },
});
