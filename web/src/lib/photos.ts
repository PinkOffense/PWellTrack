import { tokenStorage } from './api';

/**
 * Resolve a photo URL from the API.
 * - data: URIs and http(s) URLs are used as-is
 * - Relative API paths (e.g. /pets/5/photo) go through the /api proxy
 */
export function resolvePhotoUrl(url?: string | null): string | undefined {
  if (!url) return undefined;
  if (url.startsWith('data:') || url.startsWith('http')) return url;
  const token = tokenStorage.get();
  const sep = url.includes('?') ? '&' : '?';
  return `/api${url}${token ? `${sep}token=${token}` : ''}`;
}

/**
 * Compress and resize an image file before upload.
 * Converts to JPEG at the given quality, capping dimensions at maxSize px.
 */
export function compressImage(file: File, maxSize = 1024, quality = 0.8): Promise<File> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const canvas = document.createElement('canvas');
      let { width, height } = img;
      if (width > maxSize || height > maxSize) {
        if (width > height) {
          height = Math.round((height * maxSize) / width);
          width = maxSize;
        } else {
          width = Math.round((width * maxSize) / height);
          height = maxSize;
        }
      }
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) { reject(new Error('Canvas not supported')); return; }
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => {
          if (!blob) { reject(new Error('Compression failed')); return; }
          resolve(new File([blob], file.name.replace(/\.\w+$/, '.jpg'), { type: 'image/jpeg' }));
        },
        'image/jpeg',
        quality,
      );
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };
    img.src = url;
  });
}
