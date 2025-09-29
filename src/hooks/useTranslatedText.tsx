import { useState, useEffect, useRef } from 'react';
import { useTranslation } from '@/contexts/TranslationContext';

export const useTranslatedText = (
  originalText: string,
  contentKey: string,
  pagePath?: string,
  elementType?: string
) => {
  const { currentLanguage, translate } = useTranslation();
  const [translatedText, setTranslatedText] = useState(originalText);
  const [isLoading, setIsLoading] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (currentLanguage === 'en') {
      setTranslatedText(originalText);
      setIsLoading(false);
      return;
    }

    // Clear any existing timeout and abort any pending request
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Debounce the translation request
    timeoutRef.current = setTimeout(async () => {
      setIsLoading(true);
      abortControllerRef.current = new AbortController();
      
      try {
        const translated = await translate(
          originalText, 
          contentKey, 
          pagePath, 
          elementType,
          abortControllerRef.current.signal
        );
        
        if (!abortControllerRef.current.signal.aborted) {
          setTranslatedText(translated);
        }
      } catch (error) {
        if (!abortControllerRef.current?.signal.aborted) {
          console.error('Translation failed:', error);
          setTranslatedText(originalText);
        }
      } finally {
        if (!abortControllerRef.current?.signal.aborted) {
          setIsLoading(false);
        }
      }
    }, 100); // 100ms debounce

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [currentLanguage, originalText, contentKey, pagePath, elementType, translate]);

  return { translatedText, isLoading };
};