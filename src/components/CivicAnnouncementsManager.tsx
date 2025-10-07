import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { civicApi } from "@/lib/civicApi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Megaphone, Plus, Edit, Trash2, Save, Loader2, Upload, X, Image } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format, parseISO } from "date-fns";

interface CivicAnnouncementsManagerProps {
  orgId: string;
}

interface Announcement {
  id: string;
  title: string;
  content: string;
  photos?: string[];
  created_at: string;
}

const CivicAnnouncementsManager = ({ orgId }: CivicAnnouncementsManagerProps) => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    title: "",
    content: "",
  });

  useEffect(() => {
    fetchAnnouncements();
  }, [orgId]);

  const fetchAnnouncements = async () => {
    try {
      const data = await civicApi.listAnnouncements();
      setAnnouncements(data || []);
    } catch (error) {
      console.error('Error fetching announcements:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to load announcements",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.title.trim() || !formData.content.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);

    try {
      const announcementData = {
        title: formData.title,
        content: formData.content,
        photos: uploadedPhotos,
      };

      if (editingAnnouncement) {
        await civicApi.updateAnnouncement(editingAnnouncement.id, announcementData);
        toast({
          title: "Success",
          description: "Announcement updated successfully",
        });
      } else {
        await civicApi.createAnnouncement(announcementData);
        toast({
          title: "Success",
          description: "Announcement created successfully",
        });
      }

      setFormData({ title: "", content: "" });
      setUploadedPhotos([]);
      setEditingAnnouncement(null);
      setIsDialogOpen(false);
      fetchAnnouncements();
    } catch (error) {
      console.error('Error saving announcement:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save announcement",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (announcement: Announcement) => {
    setEditingAnnouncement(announcement);
    setFormData({
      title: announcement.title,
      content: announcement.content,
    });
    setUploadedPhotos(announcement.photos || []);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await civicApi.deleteAnnouncement(id);
      toast({
        title: "Success",
        description: "Announcement deleted successfully",
      });
      fetchAnnouncements();
    } catch (error) {
      console.error('Error deleting announcement:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete announcement",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({ title: "", content: "" });
    setUploadedPhotos([]);
    setEditingAnnouncement(null);
  };

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const newPhotos: string[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Validate file type
        if (!file.type.startsWith('image/')) {
          toast({
            title: "Error", 
            description: `${file.name} is not a valid image file`,
            variant: "destructive",
          });
          continue;
        }

        // Compress the image before upload
        let compressedFile: File;
        try {
          const { compressImage, getOptimalCompressionOptions } = await import('../utils/imageCompression');
          const compressionOptions = getOptimalCompressionOptions(file.size);
          compressedFile = await compressImage(file, compressionOptions);
          
          console.log(`Compressed ${file.name}: ${file.size} -> ${compressedFile.size} bytes`);
        } catch (compressionError) {
          console.warn('Failed to compress image, using original:', compressionError);
          compressedFile = file;
        }

        // Validate compressed file size (still check 5MB limit)
        if (compressedFile.size > 5 * 1024 * 1024) {
          toast({
            title: "Error",
            description: `${file.name} is still too large after compression. Please use a smaller image`,
            variant: "destructive",
          });
          continue;
        }

        const fileName = `announcements/${Date.now()}-${i}-${file.name}`;
        
        const { data, error } = await supabase.storage
          .from('civic-files')
          .upload(fileName, compressedFile);

        if (error) throw error;

        const { data: { publicUrl } } = supabase.storage
          .from('civic-files')
          .getPublicUrl(fileName);

        newPhotos.push(publicUrl);
      }

      setUploadedPhotos(prev => [...prev, ...newPhotos]);
      
      toast({
        title: "Success",
        description: `${newPhotos.length} photo(s) uploaded successfully`,
      });
    } catch (error) {
      console.error('Error uploading photos:', error);
      toast({
        title: "Error",
        description: "Failed to upload photos",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const removePhoto = (photoUrl: string) => {
    setUploadedPhotos(prev => prev.filter(url => url !== photoUrl));
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/3"></div>
            <div className="h-20 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Megaphone className="h-5 w-5" />
            Announcements
          </CardTitle>
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Announcement
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingAnnouncement ? "Edit Announcement" : "Create New Announcement"}
                </DialogTitle>
                <DialogDescription>
                  Share important updates and information with your community.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Announcement title"
                  />
                </div>
                <div>
                  <Label htmlFor="content">Content</Label>
                  <Textarea
                    id="content"
                    value={formData.content}
                    onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                    placeholder="Write your announcement here..."
                    rows={6}
                  />
                </div>

                {/* Photo Upload Section */}
                <div className="space-y-3">
                  <Label>Photos (optional)</Label>
                  <div className="flex items-center gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      disabled={uploading}
                      onClick={() => document.getElementById('photo-upload')?.click()}
                    >
                      {uploading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="mr-2 h-4 w-4" />
                          Upload Photos
                        </>
                      )}
                    </Button>
                    <input
                      id="photo-upload"
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                    <span className="text-sm text-muted-foreground">
                      Max 5MB per image
                    </span>
                  </div>
                  
                  {/* Display uploaded photos */}
                  {uploadedPhotos.length > 0 && (
                    <div className="grid grid-cols-3 gap-3">
                      {uploadedPhotos.map((photoUrl, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={photoUrl}
                            alt={`Upload ${index + 1}`}
                            className="w-full h-20 object-cover rounded border"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => removePhoto(photoUrl)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsDialogOpen(false);
                      resetForm();
                    }}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleSave} disabled={saving}>
                    {saving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        {editingAnnouncement ? "Update" : "Create"}
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {announcements.length === 0 ? (
          <div className="text-center py-8">
            <Megaphone className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No announcements yet</h3>
            <p className="text-muted-foreground">
              Create your first announcement to share updates with your community.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {announcements.map((announcement) => (
              <div key={announcement.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-lg">{announcement.title}</h3>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {format(parseISO(announcement.created_at), 'MMM d, yyyy')}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(announcement)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(announcement.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="prose prose-sm max-w-none text-muted-foreground">
                  {announcement.content.split('\n').map((paragraph, index) => (
                    <p key={index} className="mb-2 last:mb-0">
                      {paragraph}
                    </p>
                  ))}
                </div>
                
                {/* Display announcement photos */}
                {announcement.photos && announcement.photos.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                      <Image className="h-4 w-4" />
                      Photos
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {announcement.photos.map((photoUrl, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={photoUrl}
                            alt={`Announcement photo ${index + 1}`}
                            className="w-full h-32 object-cover rounded border cursor-pointer hover:opacity-90 transition-opacity"
                            onClick={() => window.open(photoUrl, '_blank')}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CivicAnnouncementsManager;