import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";

type Language = {
  code: string;
  name: string;
  flag: string;
};

const SUPPORTED_LANGUAGES: Language[] = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'ht', name: 'Kreyòl', flag: '🇭🇹' },
  { code: 'he', name: 'עברית', flag: '🇮🇱' },
];

type TranslationContextType = {
  currentLanguage: string;
  supportedLanguages: Language[];
  isTranslating: boolean;
  setLanguage: (language: string) => void;
  translate: (
    contentKey: string,
    originalText: string,
    pagePath?: string
  ) => Promise<string>;
};

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

// Generate a session ID for anonymous users
const getSessionId = () => {
  let sessionId = localStorage.getItem('translation_session_id');
  if (!sessionId) {
    sessionId = 'anon_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('translation_session_id', sessionId);
  }
  return sessionId;
};

export const TranslationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState('en');

  // Load language preference on mount
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

  const [isTranslating, setIsTranslating] = useState(false);

  const setLanguage = async (language: string) => {
    setCurrentLanguage(language);
    
    // Save preference
    const sessionId = getSessionId();
    await supabase
      .from('user_language_preferences')
      .upsert({
        session_id: sessionId,
        preferred_language: language
      }, {
        onConflict: 'session_id'
      });

    // Trigger bulk translation in background for non-English languages
    if (language !== 'en') {
      // Show loading briefly then let components load normally with cached translations
      setIsTranslating(true);
      setTimeout(() => setIsTranslating(false), 2000);
      
      // Trigger bulk translation in background (don't wait for it)
      supabase.functions.invoke('bulk-translate-content').then(({ data, error }) => {
        if (error) {
          console.error('Background bulk translation error:', error);
        } else {
          console.log('Background bulk translation completed:', data);
        }
      });
    } else {
      setIsTranslating(false);
    }
  };

  const translate = async (
    contentKey: string,
    originalText: string,
    pagePath?: string
  ): Promise<string> => {
    if (currentLanguage === 'en') {
      return originalText;
    }

    try {
      const { data, error } = await supabase.functions.invoke('translate-content', {
        body: {
          content_key: contentKey,
          original_text: originalText,
          target_language: currentLanguage,
          page_path: pagePath
        }
      });

      if (error) throw error;
      
      return data?.translated_text || originalText;
    } catch (error) {
      console.error('Translation failed:', error);
      return originalText; // Fallback to original text
    }
  };

  return (
    <TranslationContext.Provider value={{
      currentLanguage,
      supportedLanguages: SUPPORTED_LANGUAGES,
      isTranslating,
      setLanguage,
      translate
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