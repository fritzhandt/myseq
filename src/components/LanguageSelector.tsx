import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Globe } from 'lucide-react';

export const LanguageSelector: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [browserInfo, setBrowserInfo] = useState({ browser: '', isMobile: false });

  useEffect(() => {
    const ua = navigator.userAgent;
    const isMobile = /Android|iPhone|iPad|iPod/i.test(ua);
    
    let browser = 'Other';
    if (ua.includes('Chrome') && !ua.includes('Edg')) browser = 'Chrome';
    else if (ua.includes('Safari') && !ua.includes('Chrome')) browser = 'Safari';
    else if (ua.includes('Firefox')) browser = 'Firefox';
    else if (ua.includes('Edg')) browser = 'Edge';
    
    setBrowserInfo({ browser, isMobile });
  }, []);

  const getInstructions = () => {
    const { browser, isMobile } = browserInfo;
    
    if (browser === 'Chrome') {
      if (isMobile) {
        return {
          title: 'Translate on Chrome Mobile',
          steps: [
            'Tap the three-dot menu (⋮) in the top right corner',
            'Select "Translate..."',
            'Choose your preferred language',
            'The page will automatically translate'
          ]
        };
      }
      return {
        title: 'Translate on Chrome Desktop',
        steps: [
          'Look for the translate icon in the address bar',
          'Click the icon and select your language',
          'Or right-click anywhere on the page',
          'Select "Translate to [your language]"'
        ]
      };
    }
    
    if (browser === 'Safari') {
      if (isMobile) {
        return {
          title: 'Translate on Safari iOS',
          steps: [
            'Tap the "aA" button in the address bar',
            'Select "Translate to [language]"',
            'Choose your preferred language',
            'The page will automatically translate'
          ]
        };
      }
      return {
        title: 'Translate on Safari Desktop',
        steps: [
          'Right-click anywhere on the page',
          'Select "Translate to [your language]"',
          'Or click the translate icon in the address bar (if available)',
          'Choose your preferred language from the dropdown'
        ]
      };
    }
    
    if (browser === 'Firefox') {
      return {
        title: 'Translate on Firefox',
        steps: [
          'Firefox requires a translation extension',
          'Install "Firefox Translations" or "Google Translate" extension',
          'Click the extension icon in the toolbar',
          'Select your preferred language to translate the page'
        ]
      };
    }
    
    if (browser === 'Edge') {
      return {
        title: 'Translate on Microsoft Edge',
        steps: [
          'Look for the translate icon in the address bar',
          'Click the icon and select your language',
          'Or right-click anywhere on the page',
          'Select "Translate to [your language]"'
        ]
      };
    }
    
    return {
      title: 'Translate This Page',
      steps: [
        'Most modern browsers have built-in translation',
        'Look for a translate icon in your address bar',
        'Or right-click on the page and look for "Translate" option',
        'You may need to enable translation in your browser settings'
      ]
    };
  };

  const instructions = getInstructions();

  return (
    <>
      <Button 
        variant="ghost" 
        size="sm" 
        className="flex items-center gap-2"
        onClick={() => setOpen(true)}
      >
        <Globe className="h-4 w-4" />
        <span className="hidden sm:inline">Translate</span>
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{instructions.title}</DialogTitle>
            <DialogDescription>
              Follow these steps to translate this page into your preferred language:
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 mt-4">
            {instructions.steps.map((step, index) => (
              <div key={index} className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">
                  {index + 1}
                </div>
                <p className="text-sm text-muted-foreground pt-0.5">{step}</p>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};