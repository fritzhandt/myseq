import { useEffect, useState } from 'react';
import { removeBackground, loadImage } from '@/utils/backgroundRemoval';

interface SealImageProps {
  src: string;
  alt: string;
  className?: string;
}

export const SealImage = ({ src, alt, className }: SealImageProps) => {
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const processImage = async () => {
      try {
        setIsProcessing(true);
        
        // Fetch the image
        const response = await fetch(src);
        const blob = await response.blob();
        
        // Load as HTMLImageElement
        const imageElement = await loadImage(blob);
        
        // Remove background
        const processedBlob = await removeBackground(imageElement);
        
        // Create object URL for display
        const url = URL.createObjectURL(processedBlob);
        setProcessedImage(url);
        setIsProcessing(false);
      } catch (err) {
        console.error('Error processing seal image:', err);
        setError(true);
        setIsProcessing(false);
      }
    };

    processImage();

    return () => {
      if (processedImage) {
        URL.revokeObjectURL(processedImage);
      }
    };
  }, [src]);

  if (error) {
    // Fallback to original image if processing fails
    return <img src={src} alt={alt} className={className} />;
  }

  if (isProcessing || !processedImage) {
    // Show a placeholder while processing
    return (
      <div className={className}>
        <div className="w-full h-full bg-muted animate-pulse rounded-full" />
      </div>
    );
  }

  return <img src={processedImage} alt={alt} className={className} />;
};
