import { useState, useEffect, useRef } from 'react';
import { useTranslation } from '@/contexts/TranslationContext';

export const useTranslatedText = (
  contentKey: string,
  originalText: string,
  pagePath?: string
) => {
  const { currentLanguage, translate } = useTranslation();
  const [translatedText, setTranslatedText] = useState(originalText);
  const [isLoading, setIsLoading] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Cancel any pending translation request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Clear any pending debounced request
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    // Reset to original text immediately if switching to English
    if (currentLanguage === 'en') {
      setTranslatedText(originalText);
      setIsLoading(false);
      return;
    }

    // Show loading state and set a debounced translation request
    setIsLoading(true);
    
    debounceTimeoutRef.current = setTimeout(async () => {
      try {
        const abortController = new AbortController();
        abortControllerRef.current = abortController;
        
        console.log(`[Translation] Fetching translation for key: ${contentKey}, language: ${currentLanguage}`);
        
        const result = await translate(
          contentKey,
          originalText,
          pagePath
        );
        
        console.log(`[Translation] Received result for key: ${contentKey}`, result.substring(0, 100));
        
        if (!abortController.signal.aborted) {
          setTranslatedText(result);
          setIsLoading(false);
        }
      } catch (error: any) {
        if (error && error.name !== 'AbortError') {
          console.error('Translation error:', error);
          setTranslatedText(originalText); // Fallback
          setIsLoading(false);
        }
      }
    }, 100); // 100ms debounce

    // Cleanup function
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [currentLanguage, originalText, contentKey, pagePath, translate]);

  return { translatedText, isLoading };
};