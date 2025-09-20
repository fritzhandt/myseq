import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Upload, X, Save } from 'lucide-react';

interface EventFormProps {
  event?: any;
  onClose: () => void;
  onSave: () => void;
}

export const EventForm = ({ event, onClose, onSave }: EventFormProps) => {
  const [formData, setFormData] = useState({
    title: event?.title || '',
    description: event?.description || '',
    location: event?.location || '',
    event_date: event?.event_date || '',
    event_time: event?.event_time || '',
    age_group: event?.age_group || '',
    elected_officials: event?.elected_officials?.join(', ') || '',
  });
  
  const [coverPhoto, setCoverPhoto] = useState<File | null>(null);
  const [additionalImages, setAdditionalImages] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const ageGroups = ['Grade School', 'Young Adult', 'Adult', 'Senior'];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const uploadFile = async (file: File, path: string) => {
    const { data, error } = await supabase.storage
      .from('event-images')
      .upload(path, file);
    
    if (error) throw error;
    
    const { data: { publicUrl } } = supabase.storage
      .from('event-images')
      .getPublicUrl(data.path);
    
    return publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let coverPhotoUrl = event?.cover_photo_url || null;
      let additionalImageUrls = event?.additional_images || [];

      // Upload cover photo if selected
      if (coverPhoto) {
        const timestamp = Date.now();
        const path = `covers/${timestamp}-${coverPhoto.name}`;
        coverPhotoUrl = await uploadFile(coverPhoto, path);
      }

      // Upload additional images if selected
      if (additionalImages.length > 0) {
        const uploadPromises = additionalImages.map(async (file, index) => {
          const timestamp = Date.now();
          const path = `additional/${timestamp}-${index}-${file.name}`;
          return uploadFile(file, path);
        });
        
        const newImageUrls = await Promise.all(uploadPromises);
        additionalImageUrls = [...additionalImageUrls, ...newImageUrls];
      }

      const eventData = {
        title: formData.title,
        description: formData.description,
        location: formData.location,
        event_date: formData.event_date,
        event_time: formData.event_time,
        age_group: formData.age_group,
        elected_officials: formData.elected_officials
          .split(',')
          .map(official => official.trim())
          .filter(official => official.length > 0),
        cover_photo_url: coverPhotoUrl,
        additional_images: additionalImageUrls,
      };

      if (event) {
        const { error } = await supabase
          .from('events')
          .update(eventData)
          .eq('id', event.id);
        
        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Event updated successfully!",
        });
      } else {
        const { error } = await supabase
          .from('events')
          .insert([eventData]);
        
        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Event created successfully!",
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

  const removeAdditionalImage = (index: number) => {
    setAdditionalImages(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <Button onClick={onClose} variant="outline">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Events
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">
            {event ? 'Edit Event' : 'Create New Event'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="title">Event Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Enter event title"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="age_group">Age Group *</Label>
                <Select
                  value={formData.age_group}
                  onValueChange={(value) => handleInputChange('age_group', value)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select age group" />
                  </SelectTrigger>
                  <SelectContent>
                    {ageGroups.map((group) => (
                      <SelectItem key={group} value={group}>
                        {group}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="event_date">Event Date *</Label>
                <Input
                  id="event_date"
                  type="date"
                  value={formData.event_date}
                  onChange={(e) => handleInputChange('event_date', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="event_time">Event Time *</Label>
                <Input
                  id="event_time"
                  type="time"
                  value={formData.event_time}
                  onChange={(e) => handleInputChange('event_time', e.target.value)}
                  required
                />
              </div>

              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="location">Location *</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  placeholder="Enter event location"
                  required
                />
              </div>

              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="elected_officials">Elected Officials (comma-separated)</Label>
                <Input
                  id="elected_officials"
                  value={formData.elected_officials}
                  onChange={(e) => handleInputChange('elected_officials', e.target.value)}
                  placeholder="e.g. John Smith, Jane Doe, Mike Johnson"
                />
              </div>

              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Enter event description"
                  rows={4}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cover_photo">Cover Photo</Label>
                <div className="border-2 border-dashed border-muted rounded-lg p-6 text-center">
                  <input
                    id="cover_photo"
                    type="file"
                    accept="image/*"
                    onChange={(e) => setCoverPhoto(e.target.files?.[0] || null)}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('cover_photo')?.click()}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Cover Photo
                  </Button>
                  {coverPhoto && (
                    <p className="mt-2 text-sm text-muted-foreground">
                      {coverPhoto.name}
                    </p>
                  )}
                  {event?.cover_photo_url && !coverPhoto && (
                    <p className="mt-2 text-sm text-muted-foreground">
                      Current cover photo will be kept
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="additional_images">Additional Images (Optional)</Label>
                <div className="border-2 border-dashed border-muted rounded-lg p-6 text-center">
                  <input
                    id="additional_images"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => setAdditionalImages(Array.from(e.target.files || []))}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('additional_images')?.click()}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Additional Images
                  </Button>
                  {additionalImages.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {additionalImages.map((file, index) => (
                        <div key={index} className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">{file.name}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeAdditionalImage(index)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-4 pt-6">
              <Button type="submit" disabled={loading} className="flex-1">
                <Save className="h-4 w-4 mr-2" />
                {loading ? 'Saving...' : (event ? 'Update Event' : 'Create Event')}
              </Button>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};