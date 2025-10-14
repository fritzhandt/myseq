import { useEffect, useState } from 'react';
import { Languages } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

declare global {
  interface Window {
    google: any;
    googleTranslateElementInit: () => void;
  }
}

const languages = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Español' },
  { code: 'zh-CN', name: '中文' },
  { code: 'bn', name: 'বাংলা' },
  { code: 'ar', name: 'العربية' },
  { code: 'fr', name: 'Français' },
  { code: 'ru', name: 'Русский' },
  { code: 'ht', name: 'Kreyòl' },
  { code: 'ko', name: '한국어' },
  { code: 'ur', name: 'اردو' },
  { code: 'pl', name: 'Polski' },
  { code: 'pt', name: 'Português' },
  { code: 'vi', name: 'Tiếng Việt' },
  { code: 'tl', name: 'Tagalog' },
  { code: 'it', name: 'Italiano' },
  { code: 'de', name: 'Deutsch' },
  { code: 'ja', name: '日本語' },
];

export const GoogleTranslate = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    // Add Google Translate script
    const addScript = () => {
      if (document.getElementById('google-translate-script')) return;
      
      const script = document.createElement('script');
      script.id = 'google-translate-script';
      script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      script.async = true;
      document.body.appendChild(script);
    };

    // Initialize Google Translate
    window.googleTranslateElementInit = () => {
      if (window.google && window.google.translate) {
        new window.google.translate.TranslateElement(
          {
            pageLanguage: 'en',
            includedLanguages: 'es,zh-CN,bn,ar,fr,ru,ht,ko,ur,pl,pt,vi,tl,it,de,ja',
            layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
            autoDisplay: false,
          },
          'google_translate_element'
        );
      }
    };

    addScript();

    // Add custom styles
    const style = document.createElement('style');
    style.innerHTML = `
      .goog-te-banner-frame.skiptranslate { 
        display: none !important; 
      }
      body { 
        top: 0px !important; 
      }
      .goog-te-gadget { 
        font-family: inherit !important; 
        font-size: 0 !important;
      }
      .goog-te-gadget .goog-te-combo { 
        padding: 4px 8px;
        border-radius: 6px;
        border: 1px solid hsl(var(--border));
        background: hsl(var(--background));
        color: hsl(var(--foreground));
        font-size: 14px;
        margin: 0 !important;
      }
      .goog-te-gadget img { 
        display: none !important; 
      }
      .goog-te-gadget-simple { 
        background-color: transparent !important;
        border: none !important;
        padding: 0 !important;
      }
      .goog-te-gadget-simple .goog-te-menu-value {
        color: hsl(var(--foreground)) !important;
      }
      .goog-te-gadget-simple .goog-te-menu-value span {
        color: hsl(var(--foreground)) !important;
      }
      .goog-te-gadget-simple .goog-te-menu-value span:first-child {
        display: none;
      }
      #google_translate_element {
        display: flex;
        align-items: center;
        gap: 4px;
      }
      @media (max-width: 640px) {
        #google_translate_element {
          display: none;
        }
      }
    `;
    document.head.appendChild(style);

    return () => {
      // Cleanup if needed
    };
  }, []);

  const changeLanguage = (langCode: string) => {
    const select = document.querySelector('.goog-te-combo') as HTMLSelectElement;
    if (select) {
      select.value = langCode;
      select.dispatchEvent(new Event('change'));
    }
  };

  if (isMobile) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <Languages className="h-5 w-5" />
            <span className="sr-only">Translate</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48 max-h-[400px] overflow-y-auto z-[100] bg-background">
          {languages.map((lang) => (
            <DropdownMenuItem
              key={lang.code}
              onClick={() => changeLanguage(lang.code)}
              className="cursor-pointer"
            >
              {lang.name}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
        <div id="google_translate_element" className="hidden"></div>
      </DropdownMenu>
    );
  }

  return (
    <div className="flex items-center gap-1">
      <Languages className="h-4 w-4 text-muted-foreground" />
      <div id="google_translate_element"></div>
    </div>
  );
};
