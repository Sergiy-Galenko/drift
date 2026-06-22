export type ProofAsset = {
  uri: string;
  contentType: string;
};

const imageExtensions = new Set(['jpg', 'jpeg', 'png', 'webp', 'heic']);
const videoExtensions = new Set(['mp4', 'mov', 'm4v', 'webm']);

export function extensionFromUri(uri: string): string {
  const cleanUri = uri.split('?')[0] ?? uri;
  const extension = cleanUri.split('.').pop()?.toLowerCase();
  return extension && extension.length <= 5 ? extension : 'jpg';
}

export function inferContentType(uri: string, mimeType?: string | null): string {
  if (mimeType) {
    return mimeType;
  }

  const extension = extensionFromUri(uri);

  if (videoExtensions.has(extension)) {
    return `video/${extension === 'mov' ? 'quicktime' : extension}`;
  }

  if (imageExtensions.has(extension)) {
    return `image/${extension === 'jpg' ? 'jpeg' : extension}`;
  }

  return 'image/jpeg';
}

export function proofFileName(uri: string, contentType: string): string {
  const extension = contentType.split('/')[1]?.replace('quicktime', 'mov') ?? extensionFromUri(uri);
  return `proof-${Date.now()}.${extension}`;
}

export function isVideoProof(url: string): boolean {
  const cleanUrl = decodeURIComponent(url.split('?')[0] ?? url).toLowerCase();
  return Array.from(videoExtensions).some((extension) => cleanUrl.endsWith(`.${extension}`));
}
