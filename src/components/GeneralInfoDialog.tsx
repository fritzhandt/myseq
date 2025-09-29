import { X } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface GeneralInfoDialogProps {
  answer: string;
  onClose: () => void;
}

export default function GeneralInfoDialog({ answer, onClose }: GeneralInfoDialogProps) {
  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-[500px] z-50 animate-in slide-in-from-bottom-5">
      <Alert className="bg-background/95 backdrop-blur-sm border-2 border-primary/20 shadow-2xl">
        <div className="flex justify-between items-start gap-4">
          <AlertDescription className="flex-1 text-sm leading-relaxed pr-2">
            {answer}
          </AlertDescription>
          <button
            onClick={onClose}
            className="shrink-0 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </button>
        </div>
        <div className="mt-3 pt-3 border-t border-border">
          <p className="text-xs text-muted-foreground italic">
            The results of this AI may be inaccurate or inappropriate. Always double check the results using other sources.
          </p>
        </div>
      </Alert>
    </div>
  );
}
