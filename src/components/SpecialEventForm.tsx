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
import { useUserRole } from '@/hooks/useUserRole';
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
  id?: string; // Add optional ID for updates
  date: string;
  title?: string;
  description?: string;
  events: EventData[];
}

interface EventData {
  id?: string; // Add optional ID for updates
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
  const { toast } = useToast();
  const { isSubAdmin } = useUserRole();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<'single_day' | 'multi_day'>('single_day');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isActive, setIsActive] = useState(false);
  const [days, setDays] = useState<SpecialEventDay[]>([]);
  const [loading, setLoading] = useState(false);
  const [assignmentsLoaded, setAssignmentsLoaded] = useState(false);

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
      console.log('Loading existing assignments for special event:', specialEvent.id);
      
      // First fetch special event days if multi-day
      if (specialEvent.type === 'multi_day') {
        const { data: daysData, error: daysError } = await supabase
          .from('special_event_days')
          .select('*')
          .eq('special_event_id', specialEvent.id)
          .order('date');

        if (daysError) {
          console.error('Error fetching days:', daysError);
          return;
        }

        console.log('Found days data:', daysData);

        if (daysData) {
          // Create days array with assignments
          const daysWithEvents = await Promise.all(
            daysData.map(async (day) => {
              console.log('Loading events for day:', day.id);
              
              const { data: assignments, error: assignmentsError } = await supabase
                .from('special_event_assignments')
                .select(`
                  event_id,
                  events (
                    id,
                    title,
                    description,
                    location,
                    event_time,
                    age_group,
                    elected_officials,
                    cover_photo_url,
                    additional_images,
                    tags
                  )
                `)
                .eq('special_event_id', specialEvent.id)
                .eq('special_event_day_id', day.id);

              if (assignmentsError) {
                console.error('Error fetching assignments for day:', day.id, assignmentsError);
                return {
                  date: day.date,
                  title: day.title || '',
                  description: day.description || '',
                  events: []
                };
              }

              console.log('Assignments for day:', day.id, assignments);

              const events = assignments?.map(assignment => {
                const event = (assignment as any).events;
                return {
                  id: event?.id, // Include the event ID for updates
                  title: event?.title || '',
                  description: event?.description || '',
                  location: event?.location || '',
                  event_time: event?.event_time || '',
                  age_group: event?.age_group || [],
                  elected_officials: event?.elected_officials || [],
                  cover_photo_url: event?.cover_photo_url || null,
                  additional_images: event?.additional_images || [],
                  tags: event?.tags || [],
                  cover_photo_file: null,
                  additional_image_files: []
                };
              }) || [];

              return {
                id: day.id, // Include the day ID for updates
                date: day.date,
                title: day.title || '',
                description: day.description || '',
                events
              };
            })
          );
          
          console.log('Setting days with events:', daysWithEvents);
          setDays(daysWithEvents);
        }
      } else {
        // Single day event - load assignments directly
        console.log('Loading single day event assignments');
        
        const { data: assignments, error: assignmentsError } = await supabase
          .from('special_event_assignments')
          .select(`
            event_id,
            events (
              id,
              title,
              description,
              location,
              event_time,
              age_group,
              elected_officials,
              cover_photo_url,
              additional_images,
              tags
            )
          `)
          .eq('special_event_id', specialEvent.id);

        if (assignmentsError) {
          console.error('Error fetching single day assignments:', assignmentsError);
          return;
        }

        console.log('Single day assignments:', assignments);

        const events = assignments?.map(assignment => {
          const event = (assignment as any).events;
          return {
            id: event?.id, // Include the event ID for updates
            title: event?.title || '',
            description: event?.description || '',
            location: event?.location || '',
            event_time: event?.event_time || '',
            age_group: event?.age_group || [],
            elected_officials: event?.elected_officials || [],
            cover_photo_url: event?.cover_photo_url || null,
            additional_images: event?.additional_images || [],
            tags: event?.tags || [],
            cover_photo_file: null,
            additional_image_files: []
          };
        }) || [];

        console.log('Setting single day events:', events);
        setDays([{
          date: specialEvent.start_date,
          events
        }]);
      }
    } catch (error) {
      console.error('Error loading existing assignments:', error);
      toast({
        title: "Error",
        description: "Failed to load existing events",
        variant: "destructive",
      });
    } finally {
      setAssignmentsLoaded(true);
    }
  };

  useEffect(() => {
    // Only initialize days if we're not editing an existing special event
    // or if assignments have been loaded and no days were found
    if (!specialEvent) {
      // New special event - initialize based on dates
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
    } else if (assignmentsLoaded && days.length === 0) {
      // Editing existing special event, assignments loaded but no days found
      // This might happen if the special event has no days/events yet
      console.log('No existing data found, initializing empty days based on dates');
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
    // If we're editing and assignments are loaded with days, don't do anything
    // The loadExistingAssignments function will have already set the days
  }, [type, startDate, endDate, specialEvent, assignmentsLoaded, days.length]);

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
        // Updates always go to main table regardless of role
        const { error } = await supabase
          .from('special_events')
          .update(specialEventData)
          .eq('id', specialEvent.id);
        
        if (error) throw error;
        specialEventId = specialEvent.id;
      } else {
        // New special events: sub-admins go to pending table, others go directly to main table
        if (isSubAdmin) {
          const userData = await supabase.auth.getUser();
          // Fetch profile info
          const { data: profile } = await supabase
            .from('user_profiles')
            .select('full_name, phone_number')
            .eq('user_id', userData.data.user?.id)
            .maybeSingle();
            
          const pendingData = { 
            ...specialEventData, 
            submitted_by: userData.data.user?.id,
            submitter_name: profile?.full_name || null,
            submitter_phone: profile?.phone_number || null
          };
          const { data, error } = await supabase
            .from('pending_special_events')
            .insert(pendingData)
            .select()
            .single();
          
          if (error) throw error;
          
          toast({
            title: "Success",
            description: "Special event submitted for approval! You'll be notified once it's reviewed.",
          });
          
          onSave();
          return; // Exit early for sub-admin submissions
        } else {
          // Main admin creates directly
          const { data, error } = await supabase
            .from('special_events')
            .insert(specialEventData)
            .select()
            .single();
          
          if (error) throw error;
          specialEventId = data.id;
        }
      }

      // Don't clear existing assignments and days - we'll update them instead
      // Only clear if this is a new special event
      if (!specialEvent?.id) {
        // Clear existing assignments (only for new events)
        await supabase
          .from('special_event_assignments')
          .delete()
          .eq('special_event_id', specialEventId);

        // Clear existing days if multi-day (only for new events)
        if (type === 'multi_day') {
          await supabase
            .from('special_event_days')
            .delete()
            .eq('special_event_id', specialEventId);
        }
      }

      // Process days and assignments
      for (const day of days) {
        let dayId: string | null = null;

        if (type === 'multi_day') {
          if (day.id) {
            // Update existing day
            const { error: dayError } = await supabase
              .from('special_event_days')
              .update({
                title: day.title || null,
                description: day.description || null,
              })
              .eq('id', day.id);

            if (dayError) throw dayError;
            dayId = day.id;
          } else {
            // Create new special event day
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
        }

        // Process events for this day
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

          // Handle file uploads
          let cover_photo_url = eventData.cover_photo_url; // Keep existing URL
          const additional_images: string[] = [...(eventData.additional_images || [])]; // Keep existing images

          if (eventData.cover_photo_file) {
            const fileExt = eventData.cover_photo_file.name.split('.').pop();
            const fileName = `${Date.now()}-${Math.random()}.${fileExt}`;
            const filePath = `${fileName}`; // Fix: Remove duplicate 'event-images/' prefix

            const { error: uploadError } = await supabase.storage
              .from('event-images')
              .upload(filePath, eventData.cover_photo_file);

            if (!uploadError) {
              const { data: urlData } = supabase.storage
                .from('event-images')
                .getPublicUrl(filePath);
              cover_photo_url = urlData.publicUrl;
              console.log('Uploaded cover photo:', cover_photo_url);
            } else {
              console.error('Error uploading cover photo:', uploadError);
            }
          }

          for (const file of eventData.additional_image_files) {
            const fileExt = file.name.split('.').pop();
            const fileName = `${Date.now()}-${Math.random()}.${fileExt}`;
            const filePath = `${fileName}`; // Fix: Remove duplicate 'event-images/' prefix

            const { error: uploadError } = await supabase.storage
              .from('event-images')
              .upload(filePath, file);

            if (!uploadError) {
              const { data: urlData } = supabase.storage
                .from('event-images')
                .getPublicUrl(filePath);
              additional_images.push(urlData.publicUrl);
              console.log('Uploaded additional image:', urlData.publicUrl);
            } else {
              console.error('Error uploading additional image:', uploadError);
            }
          }

          const eventPayload = {
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
          };

          let eventId: string;

          if (eventData.id) {
            // Update existing event
            const { error: eventError } = await supabase
              .from('events')
              .update(eventPayload)
              .eq('id', eventData.id);

            if (eventError) throw eventError;
            eventId = eventData.id;
            console.log('Updated event successfully:', eventId);
          } else {
            // Create new event
            const { data: createdEvent, error: eventError } = await supabase
              .from('events')
              .insert(eventPayload)
              .select()
              .single();

            if (eventError) throw eventError;
            eventId = createdEvent.id;
            console.log('Created event successfully:', createdEvent);

            // Create assignment for new events
            const { error: assignmentError } = await supabase
              .from('special_event_assignments')
              .insert({
                special_event_id: specialEventId,
                special_event_day_id: dayId,
                event_id: eventId,
              });

            if (assignmentError) throw assignmentError;
            console.log('Created assignment successfully');
          }
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