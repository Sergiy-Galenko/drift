import { useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams } from 'expo-router';

import { Header } from '@/components/navigation/Header';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Spinner } from '@/components/ui/Spinner';
import { Colors, F, R, S } from '@/constants/tokens';
import { useDrift } from '@/hooks/useDrift';
import { uploadDriftProof } from '@/lib/firebase/drifts';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';
import { firebaseErrorMessage } from '@/utils/formatters';
import { logger } from '@/utils/logger';

export default function ProofScreen() {
  const params = useLocalSearchParams<{ id?: string }>();
  const driftId = typeof params.id === 'string' ? params.id : undefined;
  const uid = useAuthStore((state) => state.firebaseUser?.uid);
  const pushToast = useUIStore((state) => state.pushToast);
  const { drift, loading } = useDrift(driftId);
  const [asset, setAsset] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);

  const pick = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      quality: 0.85,
    });
    if (!result.canceled) {
      setAsset(result.assets[0] ?? null);
    }
  };

  const upload = async () => {
    if (!asset || !uid || !driftId) return;
    setUploading(true);
    try {
      await uploadDriftProof({
        driftId,
        authorUid: uid,
        uri: asset.uri,
        contentType: asset.mimeType ?? 'image/jpeg',
        onProgress: setProgress,
      });
      pushToast({ title: 'Proof uploaded', message: 'Reputation updated after verification.', tone: 'success' });
    } catch (error) {
      logger.error('Proof upload failed', { error: String(error) });
      pushToast({ title: 'Upload failed', message: firebaseErrorMessage(String(error)), tone: 'danger' });
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.root}>
        <Header title="Proof" showBack />
        <Spinner label="Loading proof" />
      </View>
    );
  }

  if (!drift || drift.authorUid !== uid) {
    return (
      <View style={styles.root}>
        <Header title="Proof" showBack />
        <EmptyState title="Proof locked" message="Only the author can upload proof for this drift." />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <Header title="Upload Proof" showBack />
      <View style={styles.content}>
        <Text style={styles.title}>{drift.text}</Text>
        {asset ? <Image source={{ uri: asset.uri }} style={styles.preview} /> : <EmptyState title="Select proof" message="Upload image or video evidence before the deadline." />}
        {uploading ? <ProgressBar progress={progress} tone="ice" /> : null}
        <Button label="Choose media" variant="secondary" onPress={() => void pick()} disabled={uploading} />
        <Button label="Upload proof" onPress={() => void upload()} disabled={!asset} loading={uploading} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.bgBase,
  },
  content: {
    padding: S.lg,
    gap: S.x2,
  },
  title: {
    color: Colors.textPrimary,
    fontFamily: F.family.displayBold,
    fontSize: F.size.xl,
    lineHeight: F.size.xl * F.lineHeight.tight,
  },
  preview: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: R.lg,
    borderWidth: S.px,
    borderColor: Colors.strokeStrong,
  },
});
