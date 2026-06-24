import { Image, StyleSheet, Text, View } from 'react-native';

import { ReputationRing } from '@/components/drift/ReputationRing';
import { Colors, F, S } from '@/constants/tokens';

type AvatarProps = {
  username: string;
  avatarUrl: string | null;
  reputationScore?: number;
  size?: number;
  showReputationRing?: boolean;
};

export function Avatar({ username, avatarUrl, reputationScore = 50, size = 44, showReputationRing = true }: AvatarProps) {
  const initial = username.slice(0, 1).toUpperCase();
  return (
    <View style={styles.wrap}>
      {showReputationRing ? <ReputationRing score={reputationScore} size={size + S.sm} strokeWidth={2} /> : null}
      <View style={[styles.avatar, { width: size, height: size, borderRadius: size / 2 }]}>
        {avatarUrl ? (
          <Image source={{ uri: avatarUrl }} style={styles.image} />
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
    backgroundColor: Colors.bgInteractive,
    borderWidth: S.px,
    borderColor: Colors.strokeStrong,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  initial: {
    color: Colors.textPrimary,
    fontFamily: F.family.displayBold,
    fontSize: F.size.md,
  },
});
