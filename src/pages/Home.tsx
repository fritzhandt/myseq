import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { EventCard } from '@/components/EventCard';
import { EventCalendar } from '@/components/EventCalendar';
import SearchBar from '@/components/SearchBar';
import Navbar from '@/components/Navbar';
import CommunityAlertBanner from '@/components/CommunityAlertBanner';
import { supabase } from '@/integrations/supabase/client';
import { Calendar, MapPin, Users, Grid, CalendarDays } from 'lucide-react';

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

const Home = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchTags, setSearchTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const navigate = useNavigate();

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
    navigate(`/event/${eventId}`);
  };

  return (
    <>
      <Navbar />
      <CommunityAlertBanner />
      <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="gradient-hero text-primary-foreground py-16 md:py-20 px-4 shadow-urban">
        <div className="container mx-auto text-center">
          <p className="text-lg md:text-xl mb-4 text-yellow-300 font-bold font-oswald tracking-wide uppercase">Welcome</p>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 drop-shadow-lg">
            Which events are you looking for?
          </h1>
          <div className="flex flex-wrap justify-center gap-2 sm:gap-4 mb-8">
            {ageGroups.map((ageGroup) => (
              <Button
                key={ageGroup}
                onClick={() => handleFilterChange(ageGroup)}
                variant={selectedFilter === ageGroup ? "secondary" : "outline"}
                size="sm"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-sm text-sm sm:text-base w-32 sm:w-36 text-center"
              >
                {ageGroup}
              </Button>
            ))}
          </div>
          <Link
            to="#events"
            onClick={() => handleFilterChange(null)}
            className="inline-flex items-center text-base sm:text-lg font-medium hover:underline text-white/90 hover:text-white transition-colors"
          >
            <Calendar className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
            All Events
          </Link>
        </div>
      </div>

      {/* Search Section */}
      <section className="py-6 md:py-8 px-4 bg-muted/30">
        <div className="container mx-auto">
          <SearchBar onEventClick={handleEventClick} onSearch={handleSearch} />
        </div>
      </section>

      {/* Events Section */}
      <section id="events" className="py-12 md:py-16 px-4">
        <div className="container mx-auto">
          <div className="mb-8">
            <div className="flex flex-col gap-4">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold">
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
              
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                <span className="text-sm text-muted-foreground">View:</span>
                <div className="flex items-center gap-2">
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className="text-sm"
                  >
                    <Grid className="w-4 h-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">List View</span>
                    <span className="sm:hidden">List</span>
                  </Button>
                  <Button
                    variant={viewMode === 'calendar' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('calendar')}
                    className="text-sm"
                  >
                    <CalendarDays className="w-4 h-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">Calendar View</span>
                    <span className="sm:hidden">Calendar</span>
                  </Button>
                </div>
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
              <p className="text-muted-foreground">
                {searchQuery || searchTags.length > 0
                  ? 'No events match your search criteria. Try different keywords or tags.'
                  : selectedFilter 
                  ? `No events available for ${selectedFilter} age group.`
                  : 'No events have been created yet.'
                }
              </p>
            </div>
          ) : viewMode === 'calendar' ? (
            <EventCalendar events={filteredEvents} />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {filteredEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          )}
        </div>
      </section>
      </div>
    </>
  );
};

export default Home;