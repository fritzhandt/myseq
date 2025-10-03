import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useUserRole } from '@/hooks/useUserRole';
import { X, Upload, Trash2 } from 'lucide-react';

interface CommunityAlert {
  id?: string;
  title: string;
  short_description: string;
  long_description: string;
  photos: string[] | null;
  is_active: boolean;
}

interface CommunityAlertFormProps {
  alert?: CommunityAlert | null;
  onClose: () => void;
  onSave: () => void;
}

const CommunityAlertForm = ({ alert, onClose, onSave }: CommunityAlertFormProps) => {
  const { isSubAdmin } = useUserRole();
  const [formData, setFormData] = useState<CommunityAlert>({
    title: '',
    short_description: '',
    long_description: '',
    photos: [],
    is_active: true,
  });
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (alert) {
      setFormData(alert);
    }
  }, [alert]);

  const handleInputChange = (field: keyof CommunityAlert, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);

    try {
      // Compress images before upload
      const { compressImages, getOptimalCompressionOptions } = await import('../utils/imageCompression');
      
      const compressedFiles = await Promise.all(
        Array.from(files).map(async (file) => {
          try {
            const compressionOptions = getOptimalCompressionOptions(file.size);
            return await compressImages([file], compressionOptions);
          } catch (error) {
            console.warn('Failed to compress image, using original:', error);
            return [file];
          }
        })
      );
      
      const flatCompressedFiles = compressedFiles.flat();
      console.log(`Compressed ${files.length} images for community alert upload`);

      const uploadPromises = flatCompressedFiles.map(async (file) => {
        const fileName = `${Date.now()}-${file.name}`;
        const { data, error } = await supabase.storage
          .from('event-images')
          .upload(fileName, file);

        if (error) throw error;

        const { data: { publicUrl } } = supabase.storage
          .from('event-images')
          .getPublicUrl(fileName);

        return publicUrl;
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      
      setFormData(prev => ({
        ...prev,
        photos: [...(prev.photos || []), ...uploadedUrls]
      }));

      toast({
        title: "Success",
        description: `${uploadedUrls.length} photo(s) uploaded successfully!`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const removePhoto = (index: number) => {
    setFormData(prev => ({
      ...prev,
      photos: prev.photos?.filter((_, i) => i !== index) || []
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (alert?.id) {
        // Updates always go to main table regardless of role
        const { error } = await supabase
          .from('community_alerts')
          .update(formData)
          .eq('id', alert.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Community alert updated successfully!",
        });
      } else {
        // New alerts: sub-admins go to pending table, others go directly to main table
        const tableName = isSubAdmin ? 'pending_community_alerts' : 'community_alerts';
        let insertData;
        
        if (isSubAdmin) {
          const userData = await supabase.auth.getUser();
          // Fetch profile info
          const { data: profile } = await supabase
            .from('user_profiles')
            .select('full_name, phone_number')
            .eq('user_id', userData.data.user?.id)
            .maybeSingle();
            
          insertData = { 
            ...formData, 
            submitted_by: userData.data.user?.id,
            submitter_name: profile?.full_name || null,
            submitter_phone: profile?.phone_number || null
          };
        } else {
          insertData = formData;
        }

        const { error } = await supabase
          .from(tableName)
          .insert([insertData]);

        if (error) throw error;

        toast({
          title: "Success",
          description: isSubAdmin 
            ? "Community alert submitted for approval! You'll be notified once it's reviewed."
            : "Community alert created successfully!",
        });
      }

      onSave();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>
          {alert?.id ? 'Edit Community Alert' : 'Create Community Alert'}
        </CardTitle>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="short_description">Short Description</Label>
            <Textarea
              id="short_description"
              value={formData.short_description}
              onChange={(e) => handleInputChange('short_description', e.target.value)}
              placeholder="Brief description that will appear in the banner"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="long_description">Long Description</Label>
            <Textarea
              id="long_description"
              value={formData.long_description}
              onChange={(e) => handleInputChange('long_description', e.target.value)}
              placeholder="Detailed description for the alert page"
              className="min-h-[120px]"
              required
            />
          </div>

          <div className="space-y-4">
            <Label>Photos (Optional)</Label>
            
            {/* Upload Button */}
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                disabled={uploading}
                onClick={() => document.getElementById('photo-upload')?.click()}
              >
                <Upload className="h-4 w-4 mr-2" />
                {uploading ? 'Uploading...' : 'Upload Photos'}
              </Button>
              <input
                id="photo-upload"
                type="file"
                multiple
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />
            </div>

            {/* Photo Preview */}
            {formData.photos && formData.photos.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {formData.photos.map((photo, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={photo}
                      alt={`Upload ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removePhoto(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) => handleInputChange('is_active', checked)}
            />
            <Label htmlFor="is_active">Active Alert</Label>
          </div>

          <div className="flex gap-4 pt-4">
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Save Alert'}
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default CommunityAlertForm;