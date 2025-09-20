import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EventCard } from '@/components/EventCard';
import Navbar from '@/components/Navbar';
import { supabase } from '@/integrations/supabase/client';
import { X } from 'lucide-react';
import { format } from 'date-fns';

interface EventType {
  id: string;
  title: string;
  description: string;
  event_date: string;
  event_time: string;
  location: string;
  age_group: string[];
  cover_photo_url: string | null;
  additional_images: string[];
  elected_officials: string[];
}

interface SpecialEventDay {
  id: string;
  date: string;
  title?: string;
  description?: string;
  events: EventType[];
}

interface SpecialEvent {
  id: string;
  title: string;
  description?: string;
  type: 'single_day' | 'multi_day';
  start_date: string;
  end_date?: string;
  days: SpecialEventDay[];
}

interface SpecialEventPageProps {
  onExit: () => void;
}

const SpecialEventPage = ({ onExit }: SpecialEventPageProps) => {
  const [specialEvent, setSpecialEvent] = useState<SpecialEvent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActiveSpecialEvent();
  }, []);

  const fetchActiveSpecialEvent = async () => {
    try {
      setLoading(true);
      
      // Fetch active special event
      const { data: specialEventData, error: specialEventError } = await supabase
        .from('special_events')
        .select('*')
        .eq('is_active', true)
        .maybeSingle();

      if (specialEventError) {
        console.error('Error fetching active special event:', specialEventError);
        setLoading(false);
        return;
      }

      if (!specialEventData) {
        console.log('No active special event found');
        setLoading(false);
        return;
      }

      // Fetch special event days if multi-day
      const { data: daysData, error: daysError } = await supabase
        .from('special_event_days')
        .select('*')
        .eq('special_event_id', specialEventData.id)
        .order('date');

      if (daysError) {
        console.error('Error fetching special event days:', daysError);
      }

      // Fetch assigned events with their details
      const { data: assignmentsData, error: assignmentsError } = await supabase
        .from('special_event_assignments')
        .select(`
          *,
          events (*),
          special_event_days (*)
        `)
        .eq('special_event_id', specialEventData.id);

      if (assignmentsError) {
        console.error('Error fetching assignments:', assignmentsError);
      }

      // Organize events by day
      const eventsByDay: { [key: string]: EventType[] } = {};
      assignmentsData?.forEach((assignment) => {
        const dayKey = specialEventData.type === 'single_day' 
          ? specialEventData.start_date 
          : assignment.special_event_days?.date || assignment.events.event_date;
        
        if (!eventsByDay[dayKey]) {
          eventsByDay[dayKey] = [];
        }
        eventsByDay[dayKey].push({
          ...assignment.events,
          elected_officials: assignment.events.elected_officials || [],
          additional_images: assignment.events.additional_images || []
        } as EventType);
      });

      // Create days structure
      const days: SpecialEventDay[] = [];
      
      if (specialEventData.type === 'single_day') {
        days.push({
          id: 'single',
          date: specialEventData.start_date,
          events: eventsByDay[specialEventData.start_date] || []
        });
      } else {
        // Multi-day: use special_event_days data
        daysData?.forEach((day) => {
          days.push({
            id: day.id,
            date: day.date,
            title: day.title,
            description: day.description,
            events: eventsByDay[day.date] || []
          });
        });
      }

      setSpecialEvent({
        ...specialEventData,
        type: specialEventData.type as 'single_day' | 'multi_day',
        days
      });
    } catch (error) {
      console.error('Error fetching special event:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
          <p className="text-muted-foreground">Loading special event...</p>
        </div>
      </div>
    );
  }

  if (!specialEvent) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">No active special event found.</p>
          <Button onClick={onExit} className="mt-4">
            Return to Events
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      {/* Header */}
      <div className="gradient-hero text-primary-foreground py-16 md:py-20 px-4 shadow-urban">
        <div className="container mx-auto text-center">
          <div className="flex flex-col items-center justify-center gap-6">
            <div className="text-white">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 drop-shadow-lg">
                {specialEvent.title}
              </h1>
              {specialEvent.description && (
                <p className="text-base sm:text-lg opacity-90 max-w-2xl mx-auto">
                  {specialEvent.description}
                </p>
              )}
            </div>
            <Button 
              onClick={onExit}
              variant="outline"
              size="sm"
              className="border-white/20 text-white hover:bg-white/20 backdrop-blur-sm bg-white/10 hover:border-white/40"
            >
              <X className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Exit Special Event</span>
              <span className="sm:hidden">Exit</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Events by Day */}
      <div className="container mx-auto px-4 py-6 sm:py-8">
        <div className="space-y-8 sm:space-y-12">
          {specialEvent.days.map((day) => (
            <div key={day.id} className="space-y-4 sm:space-y-6">
              {/* Day Header */}
              <div className="text-center">
                <h2 className="text-2xl sm:text-3xl font-bold mb-2">
                  {day.title || format(new Date(day.date), 'EEEE, MMMM d, yyyy')}
                </h2>
                {day.description && (
                  <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto">
                    {day.description}
                  </p>
                )}
              </div>

              {/* Events Grid */}
              {day.events.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {day.events.map((event) => (
                    <EventCard
                      key={event.id}
                      event={event}
                    />
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-center text-muted-foreground">
                      No events scheduled for this day.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SpecialEventPage;