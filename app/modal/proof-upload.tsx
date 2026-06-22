import { useEffect } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { AppHeader } from '@/components/layout/AppHeader';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { colors } from '@/constants/colors';
import { fontFamily, radius } from '@/constants/typography';
import { useDrift } from '@/hooks/useDrift';
import { useProofUpload } from '@/hooks/useProofUpload';

export default function ProofUploadModal() {
  const router = useRouter();
  const params = useLocalSearchParams<{ driftId?: string }>();
  const driftId = typeof params.driftId === 'string' ? params.driftId : undefined;
  const driftState = useDrift(driftId);
  const upload = useProofUpload(driftState.drift);

  useEffect(() => {
    if (driftState.drift && !driftState.canUploadProof) {
      router.back();
    }
  }, [driftState.canUploadProof, driftState.drift, router]);

  const submit = async () => {
    const url = await upload.upload();

    if (url) {
      router.back();
    }
  };

  if (driftState.loading) {
    return (
      <ScreenWrapper>
        <Spinner />
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper scroll>
      <AppHeader title="Proof" eyebrow="COMPLETE THE COMMITMENT" />
      <View style={styles.wrap}>
        <Text style={styles.copy}>Upload an image or video showing that you executed the winning result.</Text>

        {upload.asset ? <Image source={{ uri: upload.asset.uri }} style={styles.preview} resizeMode="cover" /> : <View style={styles.emptyPreview}><Text style={styles.emptyText}>No proof selected.</Text></View>}

        <Button label="Choose proof" variant="secondary" fullWidth onPress={upload.pick} />
        <Button label="Upload proof" variant="primary" fullWidth disabled={!upload.asset} loading={upload.loading} onPress={submit} />

        {upload.loading ? (
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${Math.round(upload.progress * 100)}%` }]} />
          </View>
        ) : null}

        {upload.error ? <Text style={styles.error}>{upload.error}</Text> : null}
        {driftState.error ? <Text style={styles.error}>{driftState.error}</Text> : null}
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 14,
  },
  copy: {
    color: colors.textMuted,
    fontFamily: fontFamily.body,
    fontSize: 14,
    lineHeight: 20,
  },
  preview: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.stroke,
    backgroundColor: colors.surface,
  },
  emptyPreview: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.stroke,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: colors.textMuted,
    fontFamily: fontFamily.mono,
    fontSize: 12,
  },
  progressTrack: {
    height: 10,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.stroke,
    backgroundColor: colors.textGhost,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.volt,
  },
  error: {
    color: colors.fire,
    fontFamily: fontFamily.bodyMedium,
    fontSize: 13,
  },
});
