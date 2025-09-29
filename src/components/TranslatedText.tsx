import React from 'react';
import { useTranslatedText } from '@/hooks/useTranslatedText';
import { Skeleton } from '@/components/ui/skeleton';

interface TranslatedTextProps {
  children: string;
  contentKey: string;
  pagePath?: string;
  elementType?: string;
  className?: string;
  as?: 'p' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'span' | 'div';
  showSkeleton?: boolean;
}

export const TranslatedText: React.FC<TranslatedTextProps> = ({
  children,
  contentKey,
  pagePath,
  elementType,
  className,
  as: Component = 'span',
  showSkeleton = true
}) => {
  const { translatedText, isLoading } = useTranslatedText(
    children,
    contentKey,
    pagePath,
    elementType
  );

  // For very short loading times, don't show skeleton to avoid flicker
  if (isLoading && showSkeleton && children.length > 10) {
    return <Skeleton className={`inline-block ${className}`} style={{ width: `${Math.min(children.length * 0.6, 200)}px`, height: '1.2em' }} />;
  }

  return (
    <Component className={className} style={{ opacity: isLoading ? 0.7 : 1, transition: 'opacity 0.2s ease' }}>
      {translatedText}
    </Component>
  );
};