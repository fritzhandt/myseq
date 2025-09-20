import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { EventCard } from '@/components/EventCard';
import { EventCalendar } from '@/components/EventCalendar';
import SearchBar from '@/components/SearchBar';
import Navbar from '@/components/Navbar';
import { supabase } from '@/integrations/supabase/client';
import { Calendar, Grid, CalendarDays } from 'lucide-react';
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
  tags?: string[];
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

interface SearchFilters {
  sortBy: 'date-asc' | 'date-desc';
  dateFrom?: Date;
  dateTo?: Date;
}

interface SpecialEventPageProps {
  onExit: () => void;
}

const SpecialEventPage = ({ onExit }: SpecialEventPageProps) => {
  const [specialEvent, setSpecialEvent] = useState<SpecialEvent | null>(null);
  const [allEvents, setAllEvents] = useState<EventType[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<EventType[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchTags, setSearchTags] = useState<string[]>([]);
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({
    sortBy: 'date-asc',
    dateFrom: undefined,
    dateTo: undefined
  });
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActiveSpecialEvent();
  }, []);

  useEffect(() => {
    filterEvents();
  }, [allEvents, searchQuery, searchTags, searchFilters]);

  const filterEvents = useCallback(() => {
    let filtered = allEvents;

    // Apply search filters
    if (searchQuery.trim() || searchTags.length > 0) {
      filtered = filtered.filter(event => {
        const matchesQuery = !searchQuery.trim() || 
          event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          event.description.toLowerCase().includes(searchQuery.toLowerCase());
        
        const matchesTags = searchTags.length === 0 || 
          (event.tags && searchTags.some(tag => event.tags.includes(tag)));
        
        return matchesQuery && matchesTags;
      });
    }

    // Apply date range filters
    if (searchFilters.dateFrom || searchFilters.dateTo) {
      filtered = filtered.filter(event => {
        const eventDate = new Date(event.event_date);
        
        if (searchFilters.dateFrom && eventDate < searchFilters.dateFrom) {
          return false;
        }
        
        if (searchFilters.dateTo && eventDate > searchFilters.dateTo) {
          return false;
        }
        
        return true;
      });
    }

    // Sort events
    if (searchFilters.sortBy === 'date-asc') {
      filtered.sort((a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime());
    } else {
      filtered.sort((a, b) => new Date(b.event_date).getTime() - new Date(a.event_date).getTime());
    }

    setFilteredEvents(filtered);
  }, [allEvents, searchQuery, searchTags, searchFilters]);

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

      // Collect all events for filtering
      const allSpecialEvents: EventType[] = [];
      days.forEach(day => {
        allSpecialEvents.push(...day.events);
      });
      setAllEvents(allSpecialEvents);

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

  const handleSearch = (query: string, tags: string[], filters: SearchFilters) => {
    setSearchQuery(query);
    setSearchTags(tags);
    setSearchFilters(filters);
  };

  const handleEventClick = (eventId: string) => {
    // Navigate to event detail if needed
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
              className="border-white/20 text-white hover:bg-white/20 backdrop-blur-sm bg-white/10 hover:border-white/40 px-4 py-2"
            >
              <Calendar className="h-4 w-4 mr-2" />
              All Events
            </Button>
          </div>
        </div>
      </div>

      {/* Search Section */}
      <section className="py-6 md:py-8 px-4 bg-muted/30">
        <div className="container mx-auto">
          <SearchBar onEventClick={handleEventClick} onSearch={handleSearch} />
        </div>
      </section>

      {/* View Mode Controls */}
      <section className="py-6 px-4">
        <div className="container mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl md:text-3xl font-bold">Events</h2>
            <div className="flex gap-2">
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="flex items-center gap-2"
              >
                <Grid className="h-4 w-4" />
                <span className="hidden sm:inline">List</span>
              </Button>
              <Button
                variant={viewMode === 'calendar' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('calendar')}
                className="flex items-center gap-2"
              >
                <CalendarDays className="h-4 w-4" />
                <span className="hidden sm:inline">Calendar</span>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Events Display */}
      <div className="container mx-auto px-4 pb-8">
        {viewMode === 'calendar' ? (
          <EventCalendar events={filteredEvents.map(event => ({ ...event, tags: event.tags || [] }))} />
        ) : (
          <div className="space-y-8 sm:space-y-12">
            {/* Show filtered events organized by day */}
            {(() => {
              // Group filtered events by date
              const eventsByDate: { [key: string]: EventType[] } = {};
              filteredEvents.forEach(event => {
                const dateKey = event.event_date;
                if (!eventsByDate[dateKey]) {
                  eventsByDate[dateKey] = [];
                }
                eventsByDate[dateKey].push(event);
              });

              // Sort dates
              const sortedDates = Object.keys(eventsByDate).sort((a, b) => 
                new Date(a).getTime() - new Date(b).getTime()
              );

              if (sortedDates.length === 0) {
                return (
                  <Card>
                    <CardContent className="pt-6">
                      <p className="text-center text-muted-foreground">
                        No events match your current filters.
                      </p>
                    </CardContent>
                  </Card>
                );
              }

              return sortedDates.map(date => {
                const dayEvents = eventsByDate[date];
                const dayInfo = specialEvent.days.find(day => day.date === date);
                
                return (
                  <div key={date} className="space-y-4 sm:space-y-6">
                    {/* Day Header */}
                    <div className="text-center">
                      {dayInfo?.title ? (
                        <>
                          <h2 className="text-2xl sm:text-3xl font-bold mb-2">
                            {dayInfo.title}
                          </h2>
                          <p className="text-muted-foreground text-sm sm:text-base mb-2">
                            {format(new Date(date), 'EEEE, MMMM d, yyyy')}
                          </p>
                        </>
                      ) : (
                        <h2 className="text-2xl sm:text-3xl font-bold mb-2">
                          {format(new Date(date), 'EEEE, MMMM d, yyyy')}
                        </h2>
                      )}
                      {dayInfo?.description && (
                        <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto">
                          {dayInfo.description}
                        </p>
                      )}
                    </div>

                    {/* Events Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                      {dayEvents.map((event) => (
                        <EventCard
                          key={event.id}
                          event={event}
                        />
                      ))}
                    </div>
                  </div>
                );
              });
            })()}
          </div>
        )}
      </div>
    </div>
  );
};

export default SpecialEventPage;