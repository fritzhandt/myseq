import { useState, useEffect } from 'react';
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

  useEffect(() => {
    if (currentLanguage === 'en') {
      setTranslatedText(originalText);
      return;
    }

    const translateText = async () => {
      setIsLoading(true);
      try {
        const translated = await translate(originalText, contentKey, pagePath, elementType);
        setTranslatedText(translated);
      } catch (error) {
        console.error('Translation failed:', error);
        setTranslatedText(originalText);
      } finally {
        setIsLoading(false);
      }
    };

    translateText();
  }, [currentLanguage, originalText, contentKey, pagePath, elementType, translate]);

  return { translatedText, isLoading };
};