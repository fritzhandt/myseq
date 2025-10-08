import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useIsMobile } from '@/hooks/use-mobile';
import { Download, Share, MoreVertical, Plus } from 'lucide-react';

export default function AddToHomeButton() {
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useIsMobile();

  // Don't show on desktop
  if (!isMobile) return null;

  const isIOS = () => {
    return /iPad|iPhone|iPod/.test(navigator.userAgent);
  };

  const isAndroid = () => {
    return /Android/.test(navigator.userAgent);
  };

  const getInstructions = () => {
    if (isIOS()) {
      return {
        title: "Add SEQ to iPhone Home Screen",
        steps: [
          "Tap the Share button at the bottom of your screen",
          "Scroll down and tap 'Add to Home Screen'",
          "Tap 'Add' in the top right corner",
          "SEQ will now appear on your home screen like a native app!"
        ],
        icon: <Share className="h-6 w-6" />
      };
    } else if (isAndroid()) {
      return {
        title: "Add SEQ to Android Home Screen",
        steps: [
          "Tap the menu button (three dots) in your browser",
          "Tap 'Add to Home screen' or 'Install app'",
          "Tap 'Add' or 'Install' when prompted",
          "SEQ will now appear on your home screen like a native app!"
        ],
        icon: <MoreVertical className="h-6 w-6" />
      };
    } else {
      return {
        title: "Add SEQ to Home Screen",
        steps: [
          "Look for an 'Add to Home Screen' or 'Install' option in your browser menu",
          "Follow the prompts to install SEQ as a web app",
          "SEQ will appear on your home screen for quick access!"
        ],
        icon: <Download className="h-6 w-6" />
      };
    }
  };

  const instructions = getInstructions();

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-xs px-2 py-1 h-auto flex items-center gap-1"
        >
          <Plus className="h-3 w-3" />
          Add as Web App
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {instructions.icon}
            {instructions.title}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Install SEQ as a web app for faster access and a native app experience!
          </p>
          <ol className="space-y-3">
            {instructions.steps.map((step, index) => (
              <li key={index} className="flex gap-3 text-sm">
                <span className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-medium">
                  {index + 1}
                </span>
                <span className="flex-1">{step}</span>
              </li>
            ))}
          </ol>
          <div className="bg-muted/50 rounded-lg p-3 mt-4">
            <p className="text-xs text-muted-foreground">
              <strong>Benefits:</strong> Faster loading and native app-like experience on your device.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}