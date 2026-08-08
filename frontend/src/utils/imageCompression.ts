/**
 * Client-side Image Compression Utility for MINCHAL
 * 
 * Rules:
 * - Longest edge limited to 1600px.
 * - Aspect ratio strictly preserved.
 * - No upscaling if the image is already <= 1600px on its longest edge.
 * - Exported as JPEG at quality 0.8.
 * - Isolated from React UI components.
 */

export async function compressBillImage(file: File): Promise<File> {
  // If it's a PDF or non-image, return as-is
  if (!file.type.startsWith('image/')) {
    return file;
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read image file for compression.'));
    reader.onload = (event) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Failed to load image element for compression.'));
      img.onload = () => {
        try {
          const originalWidth = img.width;
          const originalHeight = img.height;
          const maxLongestEdge = 1600;

          const longestEdge = Math.max(originalWidth, originalHeight);

          let targetWidth = originalWidth;
          let targetHeight = originalHeight;

          // Only downscale if original exceeds 1600px (no upscaling)
          if (longestEdge > maxLongestEdge) {
            const scaleFactor = maxLongestEdge / longestEdge;
            targetWidth = Math.round(originalWidth * scaleFactor);
            targetHeight = Math.round(originalHeight * scaleFactor);
          }

          const canvas = document.createElement('canvas');
          canvas.width = targetWidth;
          canvas.height = targetHeight;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Failed to get 2D canvas context for image compression.'));
            return;
          }

          // Optional high-quality image smoothing
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';

          ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error('Canvas compression to blob failed.'));
                return;
              }

              // Create a compressed File object
              const compressedFileName = file.name.replace(/\.[^/.]+$/, '') + '-compressed.jpg';
              const compressedFile = new File([blob], compressedFileName, {
                type: 'image/jpeg',
                lastModified: Date.now(),
              });

              resolve(compressedFile);
            },
            'image/jpeg',
            0.8 // 80% JPEG quality
          );
        } catch (err) {
          reject(err);
        }
      };

      img.src = event.target?.result as string;
    };

    reader.readAsDataURL(file);
  });
}
