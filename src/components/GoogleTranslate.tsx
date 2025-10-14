import { useEffect } from 'react';
import { Languages } from 'lucide-react';

declare global {
  interface Window {
    google: any;
    googleTranslateElementInit: () => void;
  }
}

export const GoogleTranslate = () => {
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
      #google_translate_element .goog-te-gadget-simple {
        cursor: pointer;
      }
      #google_translate_element .goog-te-menu-value {
        display: none;
      }
      @media (min-width: 640px) {
        #google_translate_element .goog-te-menu-value {
          display: inline-block;
        }
      }
    `;
    document.head.appendChild(style);

    return () => {
      // Cleanup if needed
    };
  }, []);

  return (
    <div className="flex items-center gap-1">
      <Languages className="h-4 w-4 sm:h-4 sm:w-4 text-muted-foreground" />
      <div id="google_translate_element"></div>
    </div>
  );
};
