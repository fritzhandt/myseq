import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { X } from 'lucide-react';
import { format } from 'date-fns';
import { EventAssignmentSection } from './EventAssignmentSection';

interface Event {
  id: string;
  title: string;
  event_date: string;
  event_time: string;
  location: string;
}

interface SpecialEventDay {
  date: string;
  title?: string;
  description?: string;
  events: EventData[];
}

interface EventData {
  title: string;
  description: string;
  location: string;
  event_time: string;
  age_group: string[];
  elected_officials: string[];
  tags: string[];
  cover_photo_url: string | null;
  additional_images: string[];
  cover_photo_file: File | null;
  additional_image_files: File[];
}

interface SpecialEventFormProps {
  specialEvent?: any;
  onClose: () => void;
  onSave: () => void;
}

const SpecialEventForm = ({ specialEvent, onClose, onSave }: SpecialEventFormProps) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<'single_day' | 'multi_day'>('single_day');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isActive, setIsActive] = useState(false);
  const [days, setDays] = useState<SpecialEventDay[]>([]);
  const [loading, setLoading] = useState(false);
  const [assignmentsLoaded, setAssignmentsLoaded] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (specialEvent) {
      setTitle(specialEvent.title || '');
      setDescription(specialEvent.description || '');
      setType(specialEvent.type || 'single_day');
      setStartDate(specialEvent.start_date || '');
      setEndDate(specialEvent.end_date || '');
      setIsActive(specialEvent.is_active || false);
      
      // Load existing days and assignments
      setAssignmentsLoaded(false);
      loadExistingAssignments();
    } else {
      setAssignmentsLoaded(true);
    }
  }, [specialEvent]);

  const loadExistingAssignments = async () => {
    if (!specialEvent?.id) return;

    try {
      // First fetch special event days if multi-day
      if (specialEvent.type === 'multi_day') {
        const { data: daysData } = await supabase
          .from('special_event_days')
          .select('*')
          .eq('special_event_id', specialEvent.id)
          .order('date');

        if (daysData) {
          // Create days array with assignments
          const daysWithEvents = await Promise.all(
            daysData.map(async (day) => {
              const { data: assignments } = await supabase
                .from('special_event_assignments')
                .select(`
                  *,
                  events (*)
                `)
                .eq('special_event_id', specialEvent.id)
                .eq('special_event_day_id', day.id);

              const events = assignments?.map(assignment => ({
                title: assignment.events.title,
                description: assignment.events.description,
                location: assignment.events.location,
                event_time: assignment.events.event_time,
                age_group: assignment.events.age_group,
                elected_officials: assignment.events.elected_officials,
                cover_photo_url: assignment.events.cover_photo_url,
                additional_images: assignment.events.additional_images,
                tags: assignment.events.tags,
                cover_photo_file: null,
                additional_image_files: []
              })) || [];

              return {
                id: day.id,
                date: day.date,
                title: day.title,
                description: day.description,
                events
              };
            })
          );
          setDays(daysWithEvents);
        }
      } else {
        // Single day event - load assignments directly
        const { data: assignments } = await supabase
          .from('special_event_assignments')
          .select(`
            *,
            events (*)
          `)
          .eq('special_event_id', specialEvent.id);

        const events = assignments?.map(assignment => ({
          title: assignment.events.title,
          description: assignment.events.description,
          location: assignment.events.location,
          event_time: assignment.events.event_time,
          age_group: assignment.events.age_group,
          elected_officials: assignment.events.elected_officials,
          cover_photo_url: assignment.events.cover_photo_url,
          additional_images: assignment.events.additional_images,
          tags: assignment.events.tags,
          cover_photo_file: null,
          additional_image_files: []
        })) || [];

        setDays([{
          date: specialEvent.start_date,
          events
        }]);
      }
    } catch (error) {
      console.error('Error loading existing assignments:', error);
    } finally {
      setAssignmentsLoaded(true);
    }
  };

  useEffect(() => {
    // Only initialize days if we're not editing an existing special event
    // or if assignments have been loaded (to avoid overwriting loaded assignments)
    if (!specialEvent || assignmentsLoaded) {
      if (type === 'single_day' && startDate) {
        setDays([{ date: startDate, events: [] }]);
      } else if (type === 'multi_day' && startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const newDays: SpecialEventDay[] = [];
        
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
          newDays.push({
            date: format(d, 'yyyy-MM-dd'),
            events: []
          });
        }
        setDays(newDays);
      }
    }
  }, [type, startDate, endDate, specialEvent, assignmentsLoaded]);

  const handleUpdateDays = (updatedDays: SpecialEventDay[]) => {
    setDays(updatedDays);
  };

  const uploadFile = async (file: File, path: string): Promise<string> => {
    const { error } = await supabase.storage
      .from('event-images')
      .upload(path, file);

    if (error) {
      throw error;
    }

    const { data } = supabase.storage
      .from('event-images')
      .getPublicUrl(path);

    return data.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log('Submitting special event form with days:', days);
      
      // First, create or update the special event
      const specialEventData = {
        title,
        description,
        type,
        start_date: startDate,
        end_date: type === 'multi_day' ? endDate : null,
        is_active: isActive,
      };

      let specialEventId: string;

      if (specialEvent?.id) {
        // Update existing
        const { error } = await supabase
          .from('special_events')
          .update(specialEventData)
          .eq('id', specialEvent.id);
        
        if (error) throw error;
        specialEventId = specialEvent.id;
      } else {
        // Create new
        const { data, error } = await supabase
          .from('special_events')
          .insert(specialEventData)
          .select()
          .single();
        
        if (error) throw error;
        specialEventId = data.id;
      }

      // Clear existing assignments
      await supabase
        .from('special_event_assignments')
        .delete()
        .eq('special_event_id', specialEventId);

      // Clear existing days if multi-day
      if (type === 'multi_day') {
        await supabase
          .from('special_event_days')
          .delete()
          .eq('special_event_id', specialEventId);
      }

      // Create days and assignments
      for (const day of days) {
        let dayId: string | null = null;

        if (type === 'multi_day') {
          // Create special event day
          const { data: dayData, error: dayError } = await supabase
            .from('special_event_days')
            .insert({
              special_event_id: specialEventId,
              date: day.date,
              title: day.title || null,
              description: day.description || null,
            })
            .select()
            .single();

          if (dayError) throw dayError;
          dayId = dayData.id;
        }

        // Create events for this day
        for (const eventData of day.events) {
          console.log('Processing event:', eventData);
          
          if (!eventData.title || !eventData.description || !eventData.location || !eventData.event_time || !eventData.age_group || eventData.age_group.length === 0) {
            console.log('Skipping incomplete event:', {
              title: eventData.title,
              description: eventData.description,
              location: eventData.location,
              event_time: eventData.event_time,
              age_group: eventData.age_group
            });
            continue; // Skip incomplete events
          }

          // Upload files and get URLs
          let cover_photo_url = null;
          const additional_images: string[] = [];

          if (eventData.cover_photo_file) {
            const fileExt = eventData.cover_photo_file.name.split('.').pop();
            const fileName = `${Date.now()}-${Math.random()}.${fileExt}`;
            const filePath = `event-images/${fileName}`;

            const { error: uploadError } = await supabase.storage
              .from('event-images')
              .upload(filePath, eventData.cover_photo_file);

            if (!uploadError) {
              const { data: urlData } = supabase.storage
                .from('event-images')
                .getPublicUrl(filePath);
              cover_photo_url = urlData.publicUrl;
            }
          }

          for (const file of eventData.additional_image_files) {
            const fileExt = file.name.split('.').pop();
            const fileName = `${Date.now()}-${Math.random()}.${fileExt}`;
            const filePath = `event-images/${fileName}`;

            const { error: uploadError } = await supabase.storage
              .from('event-images')
              .upload(filePath, file);

            if (!uploadError) {
              const { data: urlData } = supabase.storage
                .from('event-images')
                .getPublicUrl(filePath);
              additional_images.push(urlData.publicUrl);
            }
          }

          // Create the event
          const { data: createdEvent, error: eventError } = await supabase
            .from('events')
            .insert({
              title: eventData.title,
              description: eventData.description,
              location: eventData.location,
              event_date: day.date,
              event_time: eventData.event_time,
              age_group: eventData.age_group,
              elected_officials: eventData.elected_officials,
              tags: eventData.tags,
              cover_photo_url,
              additional_images,
            })
            .select()
            .single();

          if (eventError) throw eventError;
          
          console.log('Created event successfully:', createdEvent);

          // Create assignment
          const { error: assignmentError } = await supabase
            .from('special_event_assignments')
            .insert({
              special_event_id: specialEventId,
              special_event_day_id: dayId,
              event_id: createdEvent.id,
            });

          if (assignmentError) throw assignmentError;
          
          console.log('Created assignment successfully');
        }
      }

      console.log('All events and assignments created successfully');

      toast({
        title: "Success",
        description: `Special event ${specialEvent ? 'updated' : 'created'} successfully!`,
      });

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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">
          {specialEvent ? 'Edit Special Event' : 'Create Special Event'}
        </h2>
        <Button onClick={onClose} variant="outline" size="sm">
          <X className="h-4 w-4" />
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>

            <div>
              <Label>Event Type *</Label>
              <RadioGroup value={type} onValueChange={(value: 'single_day' | 'multi_day') => setType(value)}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="single_day" id="single_day" />
                  <Label htmlFor="single_day">Single Day</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="multi_day" id="multi_day" />
                  <Label htmlFor="multi_day">Multi Day</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="start_date">Start Date *</Label>
                <Input
                  id="start_date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                />
              </div>
              {type === 'multi_day' && (
                <div>
                  <Label htmlFor="end_date">End Date *</Label>
                  <Input
                    id="end_date"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    required
                  />
                </div>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="is_active"
                checked={isActive}
                onCheckedChange={(checked) => setIsActive(checked as boolean)}
              />
              <Label htmlFor="is_active">Make this the active special event (replaces homepage)</Label>
            </div>
          </CardContent>
        </Card>

        {/* Event Assignment */}
        {days.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Assign Events & Add Event Details</CardTitle>
            </CardHeader>
            <CardContent>
              <EventAssignmentSection 
                days={days}
                onUpdateDays={handleUpdateDays}
                type={type}
              />
            </CardContent>
          </Card>
        )}

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Saving...' : specialEvent ? 'Update Special Event' : 'Create Special Event'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default SpecialEventForm;