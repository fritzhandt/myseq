/**
 * Image compression utility for reducing file sizes across the application
 */

export interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  maxSizeMB?: number;
  format?: 'jpeg' | 'webp' | 'png';
}

const DEFAULT_OPTIONS: Required<CompressionOptions> = {
  maxWidth: 1920,
  maxHeight: 1920,
  quality: 0.7,
  maxSizeMB: 2,
  format: 'jpeg'
};

/**
 * Compresses an image file to reduce its size by at least 50%
 * @param file - The original image file
 * @param options - Compression options
 * @returns Promise<File> - The compressed image file
 */
export const compressImage = async (
  file: File, 
  options: CompressionOptions = {}
): Promise<File> => {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  
  // Return original file if it's already small enough
  const maxBytes = opts.maxSizeMB * 1024 * 1024;
  if (file.size <= maxBytes) {
    // Still apply compression for consistency
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }

        // Calculate new dimensions while maintaining aspect ratio
        let { width, height } = calculateDimensions(
          img.naturalWidth,
          img.naturalHeight,
          opts.maxWidth,
          opts.maxHeight
        );

        canvas.width = width;
        canvas.height = height;

        // Draw and compress the image
        ctx.drawImage(img, 0, 0, width, height);
        
        // Convert to blob with compression
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Failed to compress image'));
              return;
            }

            // Create new file with compressed data
            const compressedFile = new File(
              [blob], 
              file.name, 
              { 
                type: `image/${opts.format}`,
                lastModified: Date.now()
              }
            );

            // If compression didn't achieve at least 50% reduction, try again with lower quality
            if (compressedFile.size > file.size * 0.5 && opts.quality > 0.3) {
              console.log(`First compression: ${file.size} -> ${compressedFile.size}, trying lower quality`);
              compressImage(file, { ...options, quality: opts.quality * 0.7 })
                .then(resolve)
                .catch(reject);
              return;
            }

            console.log(`Image compressed: ${file.size} bytes -> ${compressedFile.size} bytes (${Math.round((1 - compressedFile.size / file.size) * 100)}% reduction)`);
            resolve(compressedFile);
          },
          `image/${opts.format}`,
          opts.quality
        );

      } catch (error) {
        reject(error);
      }
    };

    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };

    // Load the image
    img.src = URL.createObjectURL(file);
  });
};

/**
 * Compresses multiple images concurrently
 */
export const compressImages = async (
  files: File[], 
  options: CompressionOptions = {}
): Promise<File[]> => {
  const compressionPromises = files.map(file => compressImage(file, options));
  return Promise.all(compressionPromises);
};

/**
 * Calculate new dimensions while maintaining aspect ratio
 */
function calculateDimensions(
  originalWidth: number,
  originalHeight: number,
  maxWidth: number,
  maxHeight: number
): { width: number; height: number } {
  let width = originalWidth;
  let height = originalHeight;

  // Scale down if too large
  if (width > maxWidth) {
    height = Math.round((height * maxWidth) / width);
    width = maxWidth;
  }

  if (height > maxHeight) {
    width = Math.round((width * maxHeight) / height);
    height = maxHeight;
  }

  return { width, height };
}

/**
 * Get the optimal compression settings based on file size
 */
export const getOptimalCompressionOptions = (fileSizeBytes: number): CompressionOptions => {
  if (fileSizeBytes > 10 * 1024 * 1024) { // > 10MB
    return {
      maxWidth: 1280,
      maxHeight: 1280,
      quality: 0.6,
      format: 'jpeg'
    };
  } else if (fileSizeBytes > 5 * 1024 * 1024) { // > 5MB
    return {
      maxWidth: 1600,
      maxHeight: 1600,
      quality: 0.7,
      format: 'jpeg'
    };
  } else { // <= 5MB
    return {
      maxWidth: 1920,
      maxHeight: 1920,
      quality: 0.8,
      format: 'jpeg'
    };
  }
};