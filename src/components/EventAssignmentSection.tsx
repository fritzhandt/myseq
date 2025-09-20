import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Calendar, MapPin, Clock, Users, Plus, Edit } from 'lucide-react';
import { EventForm } from './EventForm';
import { format } from 'date-fns';

interface Event {
  id: string;
  title: string;
  description: string;
  location: string;
  event_date: string;
  event_time: string;
  age_group: string;
  elected_officials: string[];
  cover_photo_url: string | null;
  tags: string[];
  additional_images: string[];
}

interface SpecialEventDay {
  date: string;
  title?: string;
  description?: string;
  eventIds: string[];
}

interface EventAssignmentSectionProps {
  days: SpecialEventDay[];
  onUpdateDays: (days: SpecialEventDay[]) => void;
  type: 'single_day' | 'multi_day';
}

export const EventAssignmentSection = ({ days, onUpdateDays, type }: EventAssignmentSectionProps) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEventForm, setShowEventForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('event_date', { ascending: true });

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error('Error fetching events:', error);
      toast({
        title: "Error",
        description: "Failed to load events",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
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

  const updateDayEvents = (dayIndex: number, eventId: string, checked: boolean) => {
    const updatedDays = days.map((day, index) => {
      if (index === dayIndex) {
        const eventIds = checked 
          ? [...day.eventIds, eventId]
          : day.eventIds.filter(id => id !== eventId);
        return { ...day, eventIds };
      }
      return day;
    });
    onUpdateDays(updatedDays);
  };

  const updateDayDetails = (dayIndex: number, field: 'title' | 'description', value: string) => {
    const updatedDays = days.map((day, index) => {
      if (index === dayIndex) {
        return { ...day, [field]: value };
      }
      return day;
    });
    onUpdateDays(updatedDays);
  };

  const handleCreateEvent = () => {
    setEditingEvent(null);
    setShowEventForm(true);
  };

  const handleEditEvent = (event: Event) => {
    setEditingEvent(event);
    setShowEventForm(true);
  };

  const handleEventFormClose = () => {
    setShowEventForm(false);
    setEditingEvent(null);
    fetchEvents(); // Refresh the events list
  };

  if (showEventForm) {
    return (
      <EventForm
        event={editingEvent}
        onClose={handleEventFormClose}
        onSave={handleEventFormClose}
      />
    );
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <p className="mt-4 text-muted-foreground">Loading events...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {days.map((day, dayIndex) => (
        <Card key={dayIndex} className="border-2">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg">
                {format(new Date(day.date), 'EEEE, MMMM d, yyyy')}
              </CardTitle>
              <Button onClick={handleCreateEvent} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add New Event
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Day Details for multi-day or single-day events */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
              <div>
                <Label htmlFor={`day_title_${dayIndex}`}>
                  {type === 'single_day' ? 'Event Day Title' : 'Day Title'}
                </Label>
                <Input
                  id={`day_title_${dayIndex}`}
                  value={day.title || ''}
                  onChange={(e) => updateDayDetails(dayIndex, 'title', e.target.value)}
                  placeholder={type === 'single_day' ? 'Optional title for this special event day' : 'Optional day title'}
                />
              </div>
              <div>
                <Label htmlFor={`day_description_${dayIndex}`}>
                  {type === 'single_day' ? 'Event Day Description' : 'Day Description'}
                </Label>
                <Input
                  id={`day_description_${dayIndex}`}
                  value={day.description || ''}
                  onChange={(e) => updateDayDetails(dayIndex, 'description', e.target.value)}
                  placeholder={type === 'single_day' ? 'Optional description for this special event day' : 'Optional day description'}
                />
              </div>
            </div>

            {/* Events List */}
            <div>
              <Label className="text-base font-semibold">Assign Events to This Day:</Label>
              <div className="mt-4 space-y-4 max-h-96 overflow-y-auto">
                {events.length === 0 ? (
                  <Card>
                    <CardContent className="text-center py-8">
                      <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
                      <h4 className="text-lg font-semibold mb-2">No events available</h4>
                      <p className="text-muted-foreground mb-4">
                        Create your first event to assign to this special event day!
                      </p>
                      <Button onClick={handleCreateEvent}>
                        <Plus className="h-4 w-4 mr-2" />
                        Create First Event
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  events.map((event) => (
                    <Card key={event.id} className={`transition-all ${day.eventIds.includes(event.id) ? 'ring-2 ring-primary bg-primary/5' : 'hover:shadow-md'}`}>
                      <CardHeader className="pb-3">
                        <div className="flex items-start gap-3">
                          <Checkbox
                            id={`event_${dayIndex}_${event.id}`}
                            checked={day.eventIds.includes(event.id)}
                            onCheckedChange={(checked) => updateDayEvents(dayIndex, event.id, checked as boolean)}
                            className="mt-1"
                          />
                          <div className="flex-1 space-y-2">
                            <div className="flex justify-between items-start">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <CardTitle className="text-lg">{event.title}</CardTitle>
                                  <Badge variant="secondary">
                                    <Users className="w-3 h-3 mr-1" />
                                    {event.age_group}
                                  </Badge>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-muted-foreground">
                                  <div className="flex items-center">
                                    <Calendar className="w-4 h-4 mr-2 text-primary" />
                                    {formatDate(event.event_date)}
                                  </div>
                                  <div className="flex items-center">
                                    <Clock className="w-4 h-4 mr-2 text-primary" />
                                    {formatTime(event.event_time)}
                                  </div>
                                  <div className="flex items-center">
                                    <MapPin className="w-4 h-4 mr-2 text-primary" />
                                    {event.location}
                                  </div>
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditEvent(event)}
                              >
                                <Edit className="w-4 h-4 mr-1" />
                                Edit
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <p className="text-sm mb-3 line-clamp-2">{event.description}</p>
                        
                        {event.elected_officials.length > 0 && (
                          <div className="space-y-1 mb-3">
                            <p className="text-xs font-medium text-muted-foreground">Sponsored by:</p>
                            <div className="flex flex-wrap gap-1">
                              {event.elected_officials.map((official, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {official}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {event.cover_photo_url && (
                          <div className="mt-3">
                            <img
                              src={event.cover_photo_url}
                              alt={event.title}
                              className="w-full h-24 object-cover rounded-md"
                            />
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};