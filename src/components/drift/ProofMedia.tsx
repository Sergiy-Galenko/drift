import { Image, StyleSheet, Text, View } from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';

import { colors } from '@/constants/colors';
import { fontFamily, radius } from '@/constants/typography';
import { formatDateTime } from '@/utils/formatters';
import { isVideoProof } from '@/utils/upload';

type ProofMediaProps = {
  url: string;
  uploadedAt: Date | null;
};

export function ProofMedia({ url, uploadedAt }: ProofMediaProps) {
  const isVideo = isVideoProof(url);

  return (
    <View style={styles.wrap}>
      {isVideo ? (
        <ProofVideo url={url} />
      ) : (
        <Image source={{ uri: url }} style={styles.media} resizeMode="cover" />
      )}
      {uploadedAt ? <Text style={styles.timestamp}>Uploaded {formatDateTime(uploadedAt)}</Text> : null}
    </View>
  );
}

function ProofVideo({ url }: { url: string }) {
  const player = useVideoPlayer({ uri: url }, (videoPlayer) => {
    videoPlayer.pause();
  });

  return <VideoView player={player} style={styles.media} nativeControls contentFit="cover" />;
}

const styles = StyleSheet.create({
  wrap: {
    overflow: 'hidden',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.stroke,
    backgroundColor: colors.surface,
  },
  media: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: colors.elevated,
  },
  timestamp: {
    color: colors.textMuted,
    fontFamily: fontFamily.mono,
    fontSize: 11,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
});
