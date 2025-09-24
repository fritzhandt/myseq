import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { BookOpen, GraduationCap, Briefcase, Crown, ChevronDown, Upload, X, Save, Tag, Plus, Trash2, Edit, Calendar, MapPin, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface CivicEventsManagerProps {
  civicOrgId: string;
}

export const CivicEventsManager = ({ civicOrgId }: CivicEventsManagerProps) => {
  const [events, setEvents] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    event_date: '',
    event_time: '',
    age_group: [],
    elected_officials: '',
    tags: [],
    is_public: false,
    registration_link: '',
    registration_phone: '',
    registration_email: '',
    office_address: '',
    registration_notes: '',
  });
  
  const [newTag, setNewTag] = useState('');
  const [noRegistrationNeeded, setNoRegistrationNeeded] = useState(false);
  const [coverPhoto, setCoverPhoto] = useState<File | null>(null);
  const [additionalImages, setAdditionalImages] = useState<File[]>([]);
  const { toast } = useToast();

  const ageGroups = ['Grade School', 'Young Adult', 'Adult', 'Senior'];
  const ageGroupIcons = {
    'Grade School': BookOpen,
    'Young Adult': GraduationCap,
    'Adult': Briefcase,
    'Senior': Crown
  };

  useEffect(() => {
    fetchEvents();
  }, [civicOrgId]);

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('civic_org_id', civicOrgId)
        .order('event_date', { ascending: true });

      if (error) throw error;
      setEvents(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch events",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      location: '',
      event_date: '',
      event_time: '',
      age_group: [],
      elected_officials: '',
      tags: [],
      is_public: false,
      registration_link: '',
      registration_phone: '',
      registration_email: '',
      office_address: '',
      registration_notes: '',
    });
    setNewTag('');
    setNoRegistrationNeeded(false);
    setCoverPhoto(null);
    setAdditionalImages([]);
    setEditingEvent(null);
  };

  const handleInputChange = (field: string, value: string | string[] | boolean) => {
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
      let coverPhotoUrl = editingEvent?.cover_photo_url || null;
      let additionalImageUrls = editingEvent?.additional_images || [];

      // Upload cover photo if selected
      if (coverPhoto) {
        const timestamp = Date.now();
        const path = `covers/${civicOrgId}/${timestamp}-${coverPhoto.name}`;
        coverPhotoUrl = await uploadFile(coverPhoto, path);
      }

      // Upload additional images if selected
      if (additionalImages.length > 0) {
        const uploadPromises = additionalImages.map(async (file, index) => {
          const timestamp = Date.now();
          const path = `additional/${civicOrgId}/${timestamp}-${index}-${file.name}`;
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
        civic_org_id: civicOrgId,
        is_public: formData.is_public,
        cover_photo_url: coverPhotoUrl,
        additional_images: additionalImageUrls,
        registration_link: formData.registration_link || null,
        registration_phone: formData.registration_phone || null,
        registration_email: formData.registration_email || null,
        office_address: formData.office_address || null,
        registration_notes: formData.registration_notes || null,
        // Only include sponsor fields if event is public
        elected_officials: formData.is_public 
          ? formData.elected_officials
            .split(',')
            .map(official => official.trim())
            .filter(official => official.length > 0)
          : [],
        tags: formData.is_public ? formData.tags : [],
      };

      if (editingEvent) {
        const { error } = await supabase
          .from('events')
          .update(eventData)
          .eq('id', editingEvent.id);
        
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

      fetchEvents();
      setShowForm(false);
      resetForm();
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

  const handleEdit = (event: any) => {
    setEditingEvent(event);
    setFormData({
      title: event.title || '',
      description: event.description || '',
      location: event.location || '',
      event_date: event.event_date || '',
      event_time: event.event_time || '',
      age_group: event.age_group || [],
      elected_officials: event.elected_officials?.join(', ') || '',
      tags: event.tags || [],
      is_public: event.is_public || false,
      registration_link: event.registration_link || '',
      registration_phone: event.registration_phone || '',
      registration_email: event.registration_email || '',
      office_address: event.office_address || '',
      registration_notes: event.registration_notes || '',
    });
    setShowForm(true);
  };

  const handleDelete = async (eventId: string) => {
    if (!confirm('Are you sure you want to delete this event?')) return;

    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', eventId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Event deleted successfully!",
      });

      fetchEvents();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    const [year, month, day] = dateString.split('-').map(Number);
    const localDate = new Date(year, month - 1, day);
    
    return localDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (timeString: string) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  if (showForm) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">
            {editingEvent ? 'Edit Event' : 'Create New Event'}
          </h3>
          <Button onClick={() => { setShowForm(false); resetForm(); }} variant="outline">
            Cancel
          </Button>
        </div>

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

            {/* Public Event Toggle */}
            <div className="md:col-span-2 space-y-4 border-t pt-6">
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_public"
                  checked={formData.is_public}
                  onCheckedChange={(checked) => handleInputChange('is_public', checked)}
                />
                <Label htmlFor="is_public" className="text-base font-semibold">
                  Make this event public
                </Label>
              </div>
              <p className="text-sm text-muted-foreground">
                Public events will appear in the main community events section and allow sponsor/tag information.
              </p>
            </div>

            {/* Sponsor and Tags fields only show when event is public */}
            {formData.is_public && (
              <>
                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="elected_officials">Elected Officials / Sponsors (comma-separated)</Label>
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
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
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
                  </div>
                </div>
              </>
            )}

            {/* Photo Upload Section */}
            <div className="md:col-span-2 space-y-4 border-t pt-6">
              <Label className="text-lg font-semibold">Event Photos</Label>
              
              <div className="space-y-2">
                <Label htmlFor="cover_photo">Cover Photo</Label>
                <Input
                  id="cover_photo"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setCoverPhoto(e.target.files?.[0] || null)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="additional_images">Additional Photos</Label>
                <Input
                  id="additional_images"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => setAdditionalImages(Array.from(e.target.files || []))}
                />
              </div>
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
              </div>

              {!noRegistrationNeeded && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="registration_link">Registration Form Link</Label>
                    <Input
                      id="registration_link"
                      type="url"
                      value={formData.registration_link}
                      onChange={(e) => handleInputChange('registration_link', e.target.value)}
                      placeholder="https://example.com/register"
                    />
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
                        placeholder="events@organization.org"
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
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="registration_notes">Additional Registration Notes</Label>
                    <Textarea
                      id="registration_notes"
                      value={formData.registration_notes}
                      onChange={(e) => handleInputChange('registration_notes', e.target.value)}
                      placeholder="Additional instructions or requirements for registration"
                      rows={3}
                    />
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" onClick={() => { setShowForm(false); resetForm(); }} variant="outline">
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              <Save className="w-4 h-4 mr-2" />
              {loading ? 'Saving...' : (editingEvent ? 'Update Event' : 'Create Event')}
            </Button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Events Management</h3>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Event
        </Button>
      </div>

      {events.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">No events created yet.</p>
            <Button onClick={() => setShowForm(true)} className="mt-4">
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Event
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {events.map((event) => (
            <Card key={event.id}>
              <CardContent className="p-6">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold text-lg">{event.title}</h4>
                      {event.is_public && (
                        <Badge variant="secondary">Public</Badge>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-3 text-sm text-muted-foreground">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {formatDate(event.event_date)}
                      </div>
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {formatTime(event.event_time)}
                      </div>
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-1" />
                        {event.location}
                      </div>
                    </div>
                    
                    <p className="text-sm mb-2 line-clamp-2">{event.description}</p>
                    
                    {event.age_group.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {event.age_group.map((group: string, index: number) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {group}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleEdit(event)}
                      variant="outline"
                      size="sm"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      onClick={() => handleDelete(event.id)}
                      variant="destructive"
                      size="sm"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};