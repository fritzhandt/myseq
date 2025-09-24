import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Images, Upload, Trash2, Edit, Loader2, X, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CivicGalleryManagerProps {
  orgId: string;
}

interface GalleryPhoto {
  id: string;
  title?: string;
  description?: string;
  photo_url: string;
  order_index: number;
  created_at: string;
}

const GALLERY_PHOTO_LIMIT = 50;

const CivicGalleryManager = ({ orgId }: CivicGalleryManagerProps) => {
  const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPhoto, setEditingPhoto] = useState<GalleryPhoto | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    files: [] as File[],
  });

  useEffect(() => {
    fetchPhotos();
  }, [orgId]);

  const fetchPhotos = async () => {
    try {
      const { data, error } = await supabase
        .from('civic_gallery')
        .select('*')
        .eq('civic_org_id', orgId)
        .order('order_index', { ascending: true });

      if (error) throw error;

      setPhotos(data || []);
    } catch (error) {
      console.error('Error fetching gallery photos:', error);
      toast({
        title: "Error",
        description: "Failed to load gallery photos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    if (files.length === 0) return;

    // Check file types
    const invalidFiles = files.filter(file => !file.type.startsWith('image/'));
    if (invalidFiles.length > 0) {
      toast({
        title: "Error",
        description: "Please select only image files",
        variant: "destructive",
      });
      return;
    }

    // Check file sizes (5MB limit each)
    const oversizedFiles = files.filter(file => file.size > 5 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      toast({
        title: "Error",
        description: "Images must be under 5MB each",
        variant: "destructive",
      });
      return;
    }

    // Check total limit
    if (photos.length + files.length > GALLERY_PHOTO_LIMIT) {
      toast({
        title: "Error",
        description: `Gallery is limited to ${GALLERY_PHOTO_LIMIT} photos. You can add ${GALLERY_PHOTO_LIMIT - photos.length} more.`,
        variant: "destructive",
      });
      return;
    }

    setFormData(prev => ({ ...prev, files }));
  };

  const handleUpload = async () => {
    if (formData.files.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one image",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      const uploadedPhotos: string[] = [];
      const totalFiles = formData.files.length;
      
      for (let i = 0; i < totalFiles; i++) {
        const file = formData.files[i];
        const fileName = `gallery/${orgId}/${Date.now()}-${i}-${file.name}`;
        
        const { data, error } = await supabase.storage
          .from('civic-files')
          .upload(fileName, file);

        if (error) throw error;

        const { data: { publicUrl } } = supabase.storage
          .from('civic-files')
          .getPublicUrl(fileName);

        uploadedPhotos.push(publicUrl);
        setUploadProgress(((i + 1) / totalFiles) * 80);
      }

      // Insert all photos into database
      const maxOrder = photos.length > 0 ? Math.max(...photos.map(p => p.order_index)) : -1;
      const photoInserts = uploadedPhotos.map((url, index) => ({
        civic_org_id: orgId,
        title: formData.title || null,
        description: formData.description || null,
        photo_url: url,
        order_index: maxOrder + index + 1,
      }));

      const { error: dbError } = await supabase
        .from('civic_gallery')
        .insert(photoInserts);

      if (dbError) throw dbError;

      setUploadProgress(100);

      toast({
        title: "Success",
        description: `${uploadedPhotos.length} photo(s) uploaded successfully`,
      });

      setFormData({ title: "", description: "", files: [] });
      setIsDialogOpen(false);
      fetchPhotos();
    } catch (error) {
      console.error('Error uploading photos:', error);
      toast({
        title: "Error",
        description: "Failed to upload photos",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleEdit = (photo: GalleryPhoto) => {
    setEditingPhoto(photo);
    setFormData({
      title: photo.title || "",
      description: photo.description || "",
      files: [],
    });
    setIsDialogOpen(true);
  };

  const handleUpdatePhoto = async () => {
    if (!editingPhoto) return;

    try {
      const { error } = await supabase
        .from('civic_gallery')
        .update({
          title: formData.title || null,
          description: formData.description || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', editingPhoto.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Photo updated successfully",
      });

      setFormData({ title: "", description: "", files: [] });
      setEditingPhoto(null);
      setIsDialogOpen(false);
      fetchPhotos();
    } catch (error) {
      console.error('Error updating photo:', error);
      toast({
        title: "Error",
        description: "Failed to update photo",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (photo: GalleryPhoto) => {
    try {
      // Extract file path from URL
      const urlParts = photo.photo_url.split('/');
      const fileName = urlParts.slice(-3).join('/'); // Get the last 3 parts: gallery/orgId/filename
      
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('civic-files')
        .remove([fileName]);

      if (storageError) throw storageError;

      // Delete from database
      const { error: dbError } = await supabase
        .from('civic_gallery')
        .delete()
        .eq('id', photo.id);

      if (dbError) throw dbError;

      toast({
        title: "Success",
        description: "Photo deleted successfully",
      });

      fetchPhotos();
    } catch (error) {
      console.error('Error deleting photo:', error);
      toast({
        title: "Error",
        description: "Failed to delete photo",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({ title: "", description: "", files: [] });
    setEditingPhoto(null);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/3"></div>
            <div className="grid grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-32 bg-muted rounded"></div>
              ))}
            </div>
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
            <Images className="h-5 w-5" />
            Gallery ({photos.length}/{GALLERY_PHOTO_LIMIT})
          </CardTitle>
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button disabled={photos.length >= GALLERY_PHOTO_LIMIT}>
                <Upload className="mr-2 h-4 w-4" />
                {photos.length >= GALLERY_PHOTO_LIMIT ? 'Gallery Full' : 'Add Photos'}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingPhoto ? "Edit Photo" : "Add Photos to Gallery"}
                </DialogTitle>
                <DialogDescription>
                  {editingPhoto 
                    ? "Update the title and description for this photo."
                    : `Upload photos to your gallery. Maximum ${GALLERY_PHOTO_LIMIT} photos total, 5MB per image.`
                  }
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                {!editingPhoto && (
                  <div>
                    <Label htmlFor="files">Select Images</Label>
                    <Input
                      id="files"
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleFileChange}
                      className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Select multiple images (JPG, PNG, WebP). Max 5MB each.
                    </p>
                  </div>
                )}
                
                <div>
                  <Label htmlFor="title">Title (optional)</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Photo title"
                  />
                </div>
                
                <div>
                  <Label htmlFor="description">Description (optional)</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Photo description"
                    rows={3}
                  />
                </div>
                
                {uploading && (
                  <div className="space-y-2">
                    <Progress value={uploadProgress} />
                    <p className="text-sm text-muted-foreground text-center">
                      Uploading... {uploadProgress}%
                    </p>
                  </div>
                )}

                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsDialogOpen(false);
                      resetForm();
                    }}
                    disabled={uploading}
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={editingPhoto ? handleUpdatePhoto : handleUpload} 
                    disabled={uploading || (!editingPhoto && formData.files.length === 0)}
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" />
                        {editingPhoto ? "Update" : "Upload"}
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
        {photos.length === 0 ? (
          <div className="text-center py-8">
            <Images className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No photos yet</h3>
            <p className="text-muted-foreground">
              Upload photos to create a gallery for your community to explore.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {photos.map((photo) => (
              <div key={photo.id} className="relative group">
                <img
                  src={photo.photo_url}
                  alt={photo.title || "Gallery photo"}
                  className="w-full h-32 object-cover rounded border"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-all duration-200 rounded flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => window.open(photo.photo_url, '_blank')}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleEdit(photo)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(photo)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                {(photo.title || photo.description) && (
                  <div className="p-2 bg-white">
                    {photo.title && (
                      <p className="text-sm font-medium truncate">{photo.title}</p>
                    )}
                    {photo.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2">{photo.description}</p>
                    )}
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

export default CivicGalleryManager;