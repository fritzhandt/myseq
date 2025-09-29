import React from 'react';
import { useTranslatedText } from '@/hooks/useTranslatedText';
import { useLocation } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';

interface TranslatedTextProps {
  contentKey: string;
  originalText: string;
  className?: string;
  as?: keyof JSX.IntrinsicElements;
  children?: React.ReactNode;
  showSkeleton?: boolean;
}

export const TranslatedText: React.FC<TranslatedTextProps> = ({
  contentKey,
  originalText,
  className,
  as: Component = 'span',
  children,
  showSkeleton = false
}) => {
  const location = useLocation();
  const pathname = location.pathname;
  const { translatedText, isLoading } = useTranslatedText(
    contentKey,
    originalText,
    pathname
  );

  // Show skeleton only for longer text when explicitly requested
  if (isLoading && showSkeleton && originalText.length > 10) {
    return <Skeleton className={`h-4 w-full ${className || ''}`} />;
  }

  const finalClassName = `${isLoading ? 'opacity-70' : ''} ${className || ''}`;

  return React.createElement(
    Component,
    { className: finalClassName },
    children || translatedText
  );
};