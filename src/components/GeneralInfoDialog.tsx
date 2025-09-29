import { X } from "lucide-react";

interface GeneralInfoDialogProps {
  answer: string;
  onClose: () => void;
}

export default function GeneralInfoDialog({ answer, onClose }: GeneralInfoDialogProps) {
  return (
    <div className="fixed bottom-6 left-4 right-4 z-50 animate-in slide-in-from-bottom-5">
      <div className="max-w-4xl mx-auto bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border-2 border-primary/20 p-6">
        <div className="flex justify-between items-start gap-4 mb-4">
          <div className="flex-1">
            <p className="text-sm md:text-base text-foreground leading-relaxed">
              {answer}
            </p>
          </div>
          <button
            onClick={onClose}
            className="shrink-0 rounded-full p-1.5 opacity-70 ring-offset-background transition-opacity hover:opacity-100 hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          >
            <X className="h-5 w-5" />
            <span className="sr-only">Close</span>
          </button>
        </div>
        <div className="pt-3 border-t border-border">
          <p className="text-xs text-muted-foreground italic">
            The results of this AI may be inaccurate or inappropriate. Always double check the results using other sources.
          </p>
        </div>
      </div>
    </div>
  );
}
