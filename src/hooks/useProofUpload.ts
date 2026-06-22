import { useCallback, useState } from 'react';
import * as ImagePicker from 'expo-image-picker';

import { uploadDriftProof } from '@/lib/firebase/drifts';
import type { Drift } from '@/types/drift';
import { inferContentType, type ProofAsset } from '@/utils/upload';

function messageFromError(error: unknown): string {
  return error instanceof Error ? error.message : 'Proof upload failed.';
}

export function useProofUpload(drift: Drift | null) {
  const [asset, setAsset] = useState<ProofAsset | null>(null);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pick = useCallback(async () => {
    setError(null);
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      setError('Media permission is required to upload proof.');
      return null;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      quality: 0.9,
      allowsEditing: false,
    });

    if (result.canceled) {
      return null;
    }

    const selectedAsset = result.assets[0];

    if (!selectedAsset) {
      return null;
    }

    const nextAsset = {
      uri: selectedAsset.uri,
      contentType: inferContentType(selectedAsset.uri, selectedAsset.mimeType),
    };

    setAsset(nextAsset);
    return nextAsset;
  }, []);

  const upload = useCallback(async () => {
    if (!drift || !asset) {
      return null;
    }

    setLoading(true);
    setError(null);
    setProgress(0);

    try {
      return await uploadDriftProof({
        driftId: drift.id,
        authorUid: drift.authorUid,
        uri: asset.uri,
        contentType: asset.contentType,
        onProgress: setProgress,
      });
    } catch (nextError) {
      const message = messageFromError(nextError);
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [asset, drift]);

  return {
    asset,
    progress,
    loading,
    error,
    pick,
    upload,
  };
}
