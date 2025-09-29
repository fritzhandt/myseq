import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from "@/integrations/supabase/client";

interface TranslationContextType {
  currentLanguage: string;
  setLanguage: (language: string) => void;
  translate: (text: string, contentKey: string, pagePath?: string, elementType?: string, signal?: AbortSignal) => Promise<string>;
  isTranslating: boolean;
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

const SUPPORTED_LANGUAGES = {
  'en': 'English',
  'es': 'Español',
  'fr': 'Français', 
  'de': 'Deutsch',
  'it': 'Italiano',
  'pt': 'Português',
  'ru': 'Русский',
  'ja': '日本語',
  'ko': '한국어',
  'zh': '中文',
  'ar': 'العربية',
  'hi': 'हिन्दी',
  'ht': 'Kreyòl Ayisyen',
  'nl': 'Nederlands',
  'sv': 'Svenska',
  'da': 'Dansk',
  'no': 'Norsk',
  'fi': 'Suomi',
  'pl': 'Polski',
  'tr': 'Türkçe',
  'th': 'ไทย',
  'vi': 'Tiếng Việt'
};

// Generate session ID for anonymous users
const getSessionId = () => {
  let sessionId = localStorage.getItem('translation_session_id');
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('translation_session_id', sessionId);
  }
  return sessionId;
};

export const TranslationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [isTranslating, setIsTranslating] = useState(false);

  // Load saved language preference on mount
  useEffect(() => {
    const loadLanguagePreference = async () => {
      const sessionId = getSessionId();
      
      const { data } = await supabase
        .from('user_language_preferences')
        .select('preferred_language')
        .eq('session_id', sessionId)
        .single();

      if (data?.preferred_language) {
        setCurrentLanguage(data.preferred_language);
      }
    };

    loadLanguagePreference();
  }, []);

  const setLanguage = async (language: string) => {
    setCurrentLanguage(language);
    
    // Save preference to database
    const sessionId = getSessionId();
    
    const { error } = await supabase
      .from('user_language_preferences')
      .upsert({
        session_id: sessionId,
        preferred_language: language
      });

    if (error) {
      console.error('Error saving language preference:', error);
    }
  };

  const translate = async (
    text: string, 
    contentKey: string, 
    pagePath?: string, 
    elementType?: string,
    signal?: AbortSignal
  ): Promise<string> => {
    // If current language is English, return original text
    if (currentLanguage === 'en') {
      return text;
    }

    // Check if request was aborted before starting
    if (signal?.aborted) {
      throw new Error('Request aborted');
    }

    try {
      setIsTranslating(true);

      const { data, error } = await supabase.functions.invoke('translate-content', {
        body: {
          content_key: contentKey,
          original_text: text,
          target_language: currentLanguage,
          page_path: pagePath,
          element_type: elementType
        }
      });

      // Check if request was aborted after the call
      if (signal?.aborted) {
        throw new Error('Request aborted');
      }

      if (error) {
        console.error('Translation error:', error);
        return text; // Return original text on error
      }

      return data.translated_text || text;
    } catch (error) {
      if (signal?.aborted) {
        throw error; // Re-throw abort errors
      }
      console.error('Translation error:', error);
      return text; // Return original text on error
    } finally {
      setIsTranslating(false);
    }
  };

  return (
    <TranslationContext.Provider value={{
      currentLanguage,
      setLanguage,
      translate,
      isTranslating
    }}>
      {children}
    </TranslationContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(TranslationContext);
  if (context === undefined) {
    throw new Error('useTranslation must be used within a TranslationProvider');
  }
  return context;
};

export { SUPPORTED_LANGUAGES };