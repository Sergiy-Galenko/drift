import { Image, StyleSheet, View } from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';

import { EmptyState } from '@/components/ui/EmptyState';
import { Colors, R, S } from '@/constants/tokens';

type ProofMediaProps = {
  url: string | null;
  type: 'image' | 'video' | null;
};

export function ProofMedia({ url, type }: ProofMediaProps) {
  if (!url || !type) {
    return <EmptyState title="No proof yet" message="The author still has to upload proof." />;
  }

  if (type === 'video') {
    return <ProofVideo url={url} />;
  }

  return (
    <View style={styles.frame}>
      <Image source={{ uri: url }} style={styles.media} />
    </View>
  );
}

function ProofVideo({ url }: { url: string }) {
  const player = useVideoPlayer(url);

  return (
    <View style={styles.frame}>
      <VideoView player={player} style={styles.media} nativeControls contentFit="cover" fullscreenOptions={{ enable: true }} />
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    overflow: 'hidden',
    borderRadius: R.lg,
    borderWidth: S.px,
    borderColor: Colors.strokeStrong,
    backgroundColor: Colors.bgInteractive,
  },
  media: {
    width: '100%',
    aspectRatio: 1,
  },
});
