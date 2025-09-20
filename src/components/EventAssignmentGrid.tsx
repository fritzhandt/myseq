import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { EventCard } from '@/components/EventCard';
import { EventCalendar } from '@/components/EventCalendar';
import SearchBar from '@/components/SearchBar';
import { EventForm } from '@/components/EventForm';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Calendar, Grid, CalendarDays, Plus, Users } from 'lucide-react';

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
  additional_images: string[];
  tags: string[];
}

const EventAssignmentGrid = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchTags, setSearchTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const { toast } = useToast();

  const ageGroups = ['Grade School', 'Young Adult', 'Adult', 'Senior'];

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
      setFilteredEvents(data || []);
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

  const filterEvents = useCallback(() => {
    let filtered = events;

    // Apply age group filter
    if (selectedFilter) {
      filtered = filtered.filter(event => event.age_group === selectedFilter);
    }

    // Apply search filters
    if (searchQuery.trim() || searchTags.length > 0) {
      filtered = filtered.filter(event => {
        const matchesQuery = !searchQuery.trim() || 
          event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          event.description.toLowerCase().includes(searchQuery.toLowerCase());
        
        const matchesTags = searchTags.length === 0 || 
          searchTags.some(tag => event.tags?.includes(tag));
        
        return matchesQuery && matchesTags;
      });
    }

    setFilteredEvents(filtered);
  }, [events, selectedFilter, searchQuery, searchTags]);

  useEffect(() => {
    filterEvents();
  }, [filterEvents]);

  const handleFilterChange = (ageGroup: string | null) => {
    setSelectedFilter(ageGroup);
  };

  const handleSearch = useCallback((query: string, tags: string[]) => {
    setSearchQuery(query);
    setSearchTags(tags);
  }, []);

  const handleEventClick = (eventId: string) => {
    // For admin, we could navigate to event detail or open edit form
    const event = events.find(e => e.id === eventId);
    if (event) {
      setEditingEvent(event);
      setShowForm(true);
    }
  };

  const handleCreateEvent = () => {
    setEditingEvent(null);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingEvent(null);
    fetchEvents(); // Refresh events after form closes
  };

  if (showForm) {
    return (
      <EventForm
        event={editingEvent}
        onClose={handleFormClose}
        onSave={handleFormClose}
      />
    );
  }

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary/10 to-primary-glow/10 rounded-lg p-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-6">
            Event Assignment & Management
          </h1>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Manage your events and assign them to special events. All events created here will automatically appear on the main events page.
          </p>
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            {ageGroups.map((ageGroup) => (
              <Button
                key={ageGroup}
                onClick={() => handleFilterChange(ageGroup)}
                variant={selectedFilter === ageGroup ? "default" : "outline"}
                size="lg"
              >
                <Users className="mr-2 h-5 w-5" />
                {ageGroup}
              </Button>
            ))}
            <Button
              onClick={handleCreateEvent}
              size="lg"
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Plus className="mr-2 h-5 w-5" />
              Create New Event
            </Button>
          </div>
          <Button
            onClick={() => handleFilterChange(null)}
            variant="ghost"
            className="text-lg"
          >
            <Calendar className="mr-2 h-5 w-5" />
            Show All Events
          </Button>
        </div>
      </div>

      {/* Search Section */}
      <div className="bg-muted/30 rounded-lg p-6">
        <SearchBar onEventClick={handleEventClick} onSearch={handleSearch} />
      </div>

      {/* Events Section */}
      <div>
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-3xl font-bold">
                {selectedFilter && searchTags.length === 0 && !searchQuery
                  ? `${selectedFilter} Events`
                  : searchQuery || searchTags.length > 0
                  ? 'Search Results'
                  : 'All Events'
                }
              </h2>
              {(selectedFilter || searchQuery || searchTags.length > 0) && (
                <Button
                  onClick={() => {
                    handleFilterChange(null);
                    setSearchQuery('');
                    setSearchTags([]);
                  }}
                  variant="outline"
                  size="sm"
                  className="mt-2"
                >
                  Clear All Filters
                </Button>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <Grid className="w-4 h-4 mr-2" />
                Grid View
              </Button>
              <Button
                variant={viewMode === 'calendar' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('calendar')}
              >
                <CalendarDays className="w-4 h-4 mr-2" />
                Calendar View
              </Button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="mt-4 text-muted-foreground">Loading events...</p>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No events found</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery || searchTags.length > 0
                ? 'No events match your search criteria. Try different keywords or tags.'
                : selectedFilter 
                ? `No events available for ${selectedFilter} age group.`
                : 'No events have been created yet.'
              }
            </p>
            <Button onClick={handleCreateEvent} size="lg">
              <Plus className="mr-2 h-5 w-5" />
              Create Your First Event
            </Button>
          </div>
        ) : viewMode === 'calendar' ? (
          <EventCalendar events={filteredEvents} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EventAssignmentGrid;