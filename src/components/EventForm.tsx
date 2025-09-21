import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { BookOpen, GraduationCap, Briefcase, Crown, ChevronDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Upload, X, Save, Tag, Plus } from 'lucide-react';

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
    age_group: event?.age_group || [],
    elected_officials: event?.elected_officials?.join(', ') || '',
    tags: event?.tags || [],
    registration_link: event?.registration_link || '',
    registration_phone: event?.registration_phone || '',
    registration_email: event?.registration_email || '',
    office_address: event?.office_address || '',
    registration_notes: event?.registration_notes || '',
  });
  
  const [newTag, setNewTag] = useState('');
  const [noRegistrationNeeded, setNoRegistrationNeeded] = useState(false);
  
  const [coverPhoto, setCoverPhoto] = useState<File | null>(null);
  const [additionalImages, setAdditionalImages] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const ageGroups = ['Grade School', 'Young Adult', 'Adult', 'Senior'];
  const ageGroupIcons = {
    'Grade School': BookOpen,
    'Young Adult': GraduationCap,
    'Adult': Briefcase,
    'Senior': Crown
  };

  const handleInputChange = (field: string, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAgeGroupChange = (ageGroup: string, checked: boolean) => {
    setFormData(prev => {
      const currentAgeGroups = Array.isArray(prev.age_group) ? prev.age_group : [];
      if (checked) {
        return { ...prev, age_group: [...currentAgeGroups, ageGroup] };
      } else {
        return { ...prev, age_group: currentAgeGroups.filter(group => group !== ageGroup) };
      }
    });
  };

  const addTag = () => {
    const trimmedTag = newTag.trim();
    if (trimmedTag && !formData.tags.includes(trimmedTag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, trimmedTag]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
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
        tags: formData.tags,
        cover_photo_url: coverPhotoUrl,
        additional_images: additionalImageUrls,
        registration_link: formData.registration_link || null,
        registration_phone: formData.registration_phone || null,
        registration_email: formData.registration_email || null,
        office_address: formData.office_address || null,
        registration_notes: formData.registration_notes || null,
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
                <Label>Age Groups *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-between"
                      type="button"
                    >
                      {Array.isArray(formData.age_group) && formData.age_group.length > 0
                        ? `${formData.age_group.length} group${formData.age_group.length > 1 ? 's' : ''} selected`
                        : 'Select age groups'
                      }
                      <ChevronDown className="h-4 w-4 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-4">
                    <div className="space-y-3">
                      {ageGroups.map((group) => {
                        const IconComponent = ageGroupIcons[group as keyof typeof ageGroupIcons];
                        return (
                          <div key={group} className="flex items-center space-x-2">
                            <Checkbox
                              id={`age-group-${group}`}
                              checked={Array.isArray(formData.age_group) ? formData.age_group.includes(group) : formData.age_group === group}
                              onCheckedChange={(checked) => handleAgeGroupChange(group, checked as boolean)}
                            />
                            <Label 
                              htmlFor={`age-group-${group}`}
                              className="text-sm font-normal cursor-pointer flex items-center"
                            >
                              <IconComponent className="w-4 h-4 mr-2" />
                              {group}
                            </Label>
                          </div>
                        );
                      })}
                    </div>
                  </PopoverContent>
                </Popover>
                <p className="text-sm text-muted-foreground">
                  Select one or more age groups for this event
                </p>
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
                <Label htmlFor="tags">Tags</Label>
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <Input
                      id="tags"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Add a tag (e.g. Job Fair, Networking)"
                      className="flex-1"
                    />
                    <Button type="button" onClick={addTag} variant="outline" size="default">
                      <Plus className="h-4 w-4 mr-1" />
                      Add
                    </Button>
                  </div>
                  {formData.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {formData.tags.map((tag, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                          onClick={() => removeTag(tag)}
                        >
                          <Tag className="w-3 h-3 mr-1" />
                          {tag}
                          <X className="w-3 h-3 ml-1" />
                        </Badge>
                      ))}
                    </div>
                  )}
                  <p className="text-sm text-muted-foreground">
                    Click on a tag to remove it. Tags help users find events more easily.
                  </p>
                </div>
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

              {/* Registration Section */}
              <div className="md:col-span-2 space-y-4 border-t pt-6">
                <div className="space-y-2">
                  <Label className="text-lg font-semibold">Registration Information</Label>
                  <div className="flex items-center gap-3 mb-4">
                    <Button
                      type="button"
                      variant={noRegistrationNeeded ? "default" : "outline"}
                      size="sm"
                      onClick={() => setNoRegistrationNeeded(!noRegistrationNeeded)}
                    >
                      No registration needed
                    </Button>
                  </div>
                  {noRegistrationNeeded ? (
                    <p className="text-sm text-green-600 font-medium">
                      No registration needed!
                    </p>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Provide registration contact information. At least one contact method is required if registration link is not provided.
                    </p>
                  )}
                </div>

                {!noRegistrationNeeded && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="registration_link">Registration Form Link (Optional)</Label>
                      <Input
                        id="registration_link"
                        type="url"
                        value={formData.registration_link}
                        onChange={(e) => handleInputChange('registration_link', e.target.value)}
                        placeholder="https://example.com/register"
                      />
                      <p className="text-sm text-muted-foreground">
                        If provided, this will show as a "Registration Form" button on the event
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="registration_phone">Registration Phone</Label>
                        <Input
                          id="registration_phone"
                          type="tel"
                          value={formData.registration_phone}
                          onChange={(e) => handleInputChange('registration_phone', e.target.value)}
                          placeholder="(555) 123-4567"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="registration_email">Registration Email</Label>
                        <Input
                          id="registration_email"
                          type="email"
                          value={formData.registration_email}
                          onChange={(e) => handleInputChange('registration_email', e.target.value)}
                          placeholder="events@city.gov"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="office_address">Office Address</Label>
                      <Input
                        id="office_address"
                        value={formData.office_address}
                        onChange={(e) => handleInputChange('office_address', e.target.value)}
                        placeholder="123 Main Street, City, State 12345"
                      />
                      <p className="text-sm text-muted-foreground">
                        Address where people can register in person
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="registration_notes">Additional Registration Notes (Optional)</Label>
                      <Textarea
                        id="registration_notes"
                        value={formData.registration_notes}
                        onChange={(e) => handleInputChange('registration_notes', e.target.value)}
                        placeholder="Additional instructions or requirements for registration"
                        rows={2}
                      />
                    </div>
                  </>
                )}
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