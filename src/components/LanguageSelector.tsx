import React from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTranslation } from '@/contexts/TranslationContext';
import { Globe, Loader2 } from 'lucide-react';
import { useAnalytics } from '@/hooks/useAnalytics';
import { useLocation } from 'react-router-dom';

export const LanguageSelector: React.FC = () => {
  const { currentLanguage, supportedLanguages, isTranslating, setLanguage } = useTranslation();
  const { trackLanguageChange } = useAnalytics();
  const location = useLocation();

  const currentLang = supportedLanguages.find(lang => lang.code === currentLanguage);

  const handleLanguageChange = (languageCode: string) => {
    if (languageCode !== 'en') {
      trackLanguageChange(languageCode, location.pathname);
    }
    setLanguage(languageCode);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="flex items-center gap-2" disabled={isTranslating}>
          {isTranslating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Globe className="h-4 w-4" />
          )}
          <span className="hidden sm:inline">
            {isTranslating 
              ? 'Translating...' 
              : currentLang 
                ? `${currentLang.flag} ${currentLang.name}` 
                : 'Language'
            }
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {supportedLanguages.map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => handleLanguageChange(language.code)}
            className={`flex items-center gap-2 ${
              currentLanguage === language.code ? 'bg-accent' : ''
            }`}
          >
            <span>{language.flag}</span>
            <span>{language.name}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};