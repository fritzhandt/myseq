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

  if (isLoading && showSkeleton) {
    return <Skeleton className={`h-4 w-full ${className}`} />;
  }

  return (
    <Component className={className}>
      {translatedText}
    </Component>
  );
};