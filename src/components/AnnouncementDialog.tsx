import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Image, Calendar } from "lucide-react";
import { format, parseISO } from "date-fns";
import PhotoViewer from "./PhotoViewer";

interface Announcement {
  id: string;
  title: string;
  content: string;
  photos?: string[];
  created_at: string;
}

interface AnnouncementDialogProps {
  announcement: Announcement | null;
  isOpen: boolean;
  onClose: () => void;
}

const AnnouncementDialog = ({ announcement, isOpen, onClose }: AnnouncementDialogProps) => {
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);
  
  if (!announcement) return null;

  // Convert photo URLs to the format expected by PhotoViewer
  const photos = announcement.photos?.map((url, index) => ({
    id: `${announcement.id}-photo-${index}`,
    photo_url: url,
    title: announcement.title
  })) || [];

  return (
    <>
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4">
            <DialogTitle className="text-xl font-bold pr-4">
              {announcement.title}
            </DialogTitle>
            <Badge variant="outline" className="flex-shrink-0">
              <Calendar className="mr-1 h-3 w-3" />
              {format(parseISO(announcement.created_at), 'MMM d, yyyy')}
            </Badge>
          </div>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Content */}
          <div className="prose prose-sm max-w-none">
            {announcement.content.split('\n').map((paragraph, index) => (
              <p key={index} className="mb-3 last:mb-0 text-foreground leading-relaxed">
                {paragraph}
              </p>
            ))}
          </div>
          
          {/* Photos */}
          {announcement.photos && announcement.photos.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-lg font-semibold text-foreground">
                <Image className="h-5 w-5" />
                Photos ({announcement.photos.length})
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {announcement.photos.map((photoUrl, index) => (
                  <div 
                    key={index} 
                    className="relative group cursor-pointer"
                    onClick={() => {
                      setViewerIndex(index);
                      setViewerOpen(true);
                    }}
                  >
                    <img
                      src={photoUrl}
                      alt={`Announcement photo ${index + 1}`}
                      className="w-full h-48 object-cover rounded-lg border hover:opacity-90 transition-opacity shadow-sm"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-200 rounded-lg flex items-center justify-center">
                      <span className="text-white opacity-0 group-hover:opacity-100 transition-opacity text-sm font-medium">
                        Click to enlarge
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
    
    <PhotoViewer
      photos={photos}
      currentIndex={viewerIndex}
      isOpen={viewerOpen}
      onClose={() => setViewerOpen(false)}
      onIndexChange={setViewerIndex}
    />
    </>
  );
};

export default AnnouncementDialog;