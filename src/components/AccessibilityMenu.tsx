import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Accessibility, Type, Palette } from 'lucide-react';

type TextSize = 'normal' | 'large' | 'extra-large';

export default function AccessibilityMenu() {
  const [textSize, setTextSize] = useState<TextSize>('normal');
  const [invertColors, setInvertColors] = useState(false);

  // Load preferences from localStorage on mount
  useEffect(() => {
    const savedTextSize = localStorage.getItem('accessibility-text-size') as TextSize;
    const savedInvertColors = localStorage.getItem('accessibility-invert-colors') === 'true';
    
    if (savedTextSize) {
      setTextSize(savedTextSize);
      applyTextSize(savedTextSize);
    }
    
    if (savedInvertColors) {
      setInvertColors(true);
      applyColorInversion(true);
    }
  }, []);

  const applyTextSize = (size: TextSize) => {
    const root = document.documentElement;
    root.classList.remove('text-normal', 'text-large', 'text-extra-large');
    root.classList.add(`text-${size}`);
  };

  const applyColorInversion = (invert: boolean) => {
    const root = document.documentElement;
    if (invert) {
      root.classList.add('invert-colors');
    } else {
      root.classList.remove('invert-colors');
    }
  };

  const handleTextSizeChange = (size: TextSize) => {
    setTextSize(size);
    localStorage.setItem('accessibility-text-size', size);
    applyTextSize(size);
  };

  const handleColorInversionToggle = () => {
    const newValue = !invertColors;
    setInvertColors(newValue);
    localStorage.setItem('accessibility-invert-colors', String(newValue));
    applyColorInversion(newValue);
  };

  const resetSettings = () => {
    setTextSize('normal');
    setInvertColors(false);
    localStorage.removeItem('accessibility-text-size');
    localStorage.removeItem('accessibility-invert-colors');
    applyTextSize('normal');
    applyColorInversion(false);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Accessibility options">
          <Accessibility className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Accessibility Options</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <DropdownMenuLabel className="text-xs font-normal text-muted-foreground flex items-center gap-2">
          <Type className="h-3 w-3" />
          Text Size
        </DropdownMenuLabel>
        <DropdownMenuItem
          onClick={() => handleTextSizeChange('normal')}
          className={textSize === 'normal' ? 'bg-accent' : ''}
        >
          Normal
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleTextSizeChange('large')}
          className={textSize === 'large' ? 'bg-accent' : ''}
        >
          Large
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleTextSizeChange('extra-large')}
          className={textSize === 'extra-large' ? 'bg-accent' : ''}
        >
          Extra Large
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuLabel className="text-xs font-normal text-muted-foreground flex items-center gap-2">
          <Palette className="h-3 w-3" />
          Colors
        </DropdownMenuLabel>
        <DropdownMenuItem onClick={handleColorInversionToggle}>
          {invertColors ? '✓ ' : ''}Invert Colors
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={resetSettings} className="text-destructive">
          Reset to Default
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
