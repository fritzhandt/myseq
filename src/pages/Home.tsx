import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { EventCard } from '@/components/EventCard';
import { EventCalendar } from '@/components/EventCalendar';
import SearchBar from '@/components/SearchBar';
import Navbar from '@/components/Navbar';
import CommunityAlertBanner from '@/components/CommunityAlertBanner';
import UserPagination from '@/components/UserPagination';
import { TranslatedText } from '@/components/TranslatedText';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Calendar, MapPin, Users, Grid, CalendarDays, BookOpen, GraduationCap, Briefcase, Crown, Zap, ArrowLeft } from 'lucide-react';
import AgeGroupButton3D from '@/components/3d/AgeGroupButton3D';
import EventCard3D from '@/components/3d/EventCard3D';
import HeroBackground3D from '@/components/3d/HeroBackground3D';
import LoadingSpinner3D from '@/components/3d/LoadingSpinner3D';
import { useAnalytics } from '@/hooks/useAnalytics';
import { useTranslation } from '@/contexts/TranslationContext';

interface Event {
  id: string;
  title: string;
  description: string;
  location: string;
  event_date: string;
  event_time: string;
  age_group: string[];
  elected_officials: string[];
  cover_photo_url: string | null;
  additional_images: string[];
  tags: string[];
}

interface SearchFilters {
  sortBy: 'date-asc' | 'date-desc';
  dateFrom?: Date;
  dateTo?: Date;
}

interface HomeProps {
  activeSpecialEvent?: {
    id: string;
    title: string;
    description: string | null;
  } | null;
  onGoToSpecialEvent?: () => void;
}

const Home = ({ activeSpecialEvent, onGoToSpecialEvent }: HomeProps = {}) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchTags, setSearchTags] = useState<string[]>([]);
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({
    sortBy: 'date-asc',
    dateFrom: undefined,
    dateTo: undefined
  });
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const { trackPageView } = useAnalytics();
  const { currentLanguage } = useTranslation();

  // Track page view
  useEffect(() => {
    trackPageView('/home', undefined, currentLanguage);
  }, []);

  // Handle AI navigation state
  useEffect(() => {
    const state = location.state as any;
    if (state) {
      if (state.searchTerm) {
        setSearchQuery(state.searchTerm);
      }
      if (state.dateStart || state.dateEnd) {
        setSearchFilters(prev => ({
          ...prev,
          dateFrom: state.dateStart ? new Date(state.dateStart) : undefined,
          dateTo: state.dateEnd ? new Date(state.dateEnd) : undefined
        }));
      }
      // Clear the navigation state
      navigate(location.pathname, { replace: true });
    }
  }, [location.state, navigate, location.pathname]);

  const ageGroups = ['Grade School', 'Young Adult', 'Adult', 'Senior'];
  const ageGroupIcons = {
    'Grade School': BookOpen,
    'Young Adult': GraduationCap,
    'Adult': Briefcase,
    'Senior': Crown
  };

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
      filtered = filtered.filter(event => 
        Array.isArray(event.age_group) ? event.age_group.includes(selectedFilter) : event.age_group === selectedFilter
      );
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

    // Apply sorting
    filtered.sort((a, b) => {
      const dateA = new Date(a.event_date);
      const dateB = new Date(b.event_date);
      
      if (searchFilters.sortBy === 'date-desc') {
        return dateB.getTime() - dateA.getTime();
      } else {
        return dateA.getTime() - dateB.getTime();
      }
    });

    setFilteredEvents(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  }, [events, selectedFilter, searchQuery, searchTags, searchFilters]);

  useEffect(() => {
    filterEvents();
  }, [filterEvents]);

  // Paginate filtered events
  const totalPages = Math.ceil(filteredEvents.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedEvents = filteredEvents.slice(startIndex, startIndex + itemsPerPage);

  const handleFilterChange = (ageGroup: string | null) => {
    // Check if we're already on this filter
    if (selectedFilter === ageGroup) {
      const filterType = ageGroup || 'All Events';
      toast({
        description: `You are already viewing ${filterType}`,
        duration: 2000,
      });
      return;
    }
    
    setSelectedFilter(ageGroup);
  };

  const handleSearch = useCallback((query: string, tags: string[], filters: SearchFilters) => {
    setSearchQuery(query);
    setSearchTags(tags);
    setSearchFilters(filters);
  }, []);

  const handleEventClick = (eventId: string) => {
    navigate(`/event/${eventId}`);
  };

  return (
    <>
      <Navbar />
      <CommunityAlertBanner />
      <div className="min-h-screen bg-background">
        
        {/* Back to Home Button */}
        <div className="bg-muted/50 border-b">
          <div className="container mx-auto px-4 py-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.location.href = '/'}
              className="flex items-center text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              <TranslatedText contentKey="back-main-menu-btn" originalText="Back to Main Menu" />
            </Button>
          </div>
        </div>
      {/* Hero Section */}
      <div className="gradient-hero text-primary-foreground py-16 md:py-20 px-4 shadow-urban relative overflow-hidden">
        <HeroBackground3D />
        <div className="container mx-auto text-center relative z-10">
          <p className="text-lg md:text-xl mb-4 text-yellow-300 font-bold font-oswald tracking-wide uppercase">
            <TranslatedText contentKey="welcome-text" originalText="Welcome" />
          </p>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 drop-shadow-lg">
            <TranslatedText contentKey="events-question" originalText="Which events are you looking for?" />
          </h1>
          {/* Mobile Dropdown */}
          <div className="block sm:hidden mb-8">
            <Select 
              key="home-age-filter"
              value={selectedFilter || 'all'} 
              onValueChange={(value) => handleFilterChange(value === 'all' ? null : value)}
            >
              <SelectTrigger className="w-full bg-white/10 border-white/20 text-white backdrop-blur-sm">
                <SelectValue placeholder={<TranslatedText contentKey="select-age-group-placeholder" originalText="Select age group" />} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all"><TranslatedText contentKey="all-events" originalText="All Events" /></SelectItem>
                {ageGroups.filter(Boolean).map((ageGroup) => {
                  const IconComponent = ageGroupIcons[ageGroup as keyof typeof ageGroupIcons];
                  return (
                    <SelectItem key={ageGroup} value={ageGroup}>
                      <div className="flex items-center">
                        <IconComponent className={`mr-2 ${ageGroup === 'Young Adult' ? 'h-5 w-5' : 'h-4 w-4'}`} />
                        {ageGroup}
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {/* Desktop/Tablet Buttons */}
          <div className="hidden sm:flex flex-wrap justify-center gap-2 sm:gap-4 mb-8">
            {ageGroups.map((ageGroup) => {
              const IconComponent = ageGroupIcons[ageGroup as keyof typeof ageGroupIcons];
              return (
                <AgeGroupButton3D
                  key={ageGroup}
                  ageGroup={ageGroup}
                  Icon={IconComponent}
                  isSelected={selectedFilter === ageGroup}
                  onClick={() => handleFilterChange(ageGroup)}
                  className={`border-white/20 text-white hover:bg-white/20 backdrop-blur-sm text-sm sm:text-base w-40 sm:w-44 text-center transition-all duration-200 ${
                    selectedFilter === ageGroup 
                      ? 'bg-yellow-400/20 border-yellow-300/60 shadow-lg ring-2 ring-yellow-300/40' 
                      : 'bg-white/10 hover:border-white/40'
                  }`}
                />
              );
            })}
          </div>
          {/* Special Event Button */}
          {activeSpecialEvent && (
            <div className="mb-6">
              <Button
                onClick={onGoToSpecialEvent}
                className="bg-yellow-400/20 border-yellow-300/60 text-white hover:bg-yellow-400/30 hover:border-yellow-300/80 backdrop-blur-sm shadow-lg ring-2 ring-yellow-300/40 text-base sm:text-lg px-6 py-3 transition-all duration-200"
                variant="outline"
              >
                <Zap className="mr-2 h-5 w-5" />
                Go to {activeSpecialEvent.title}
              </Button>
            </div>
          )}

          <Link
            to="#events"
            onClick={() => handleFilterChange(null)}
            className="inline-flex items-center text-base sm:text-lg font-medium hover:underline text-white/90 hover:text-white transition-colors"
          >
            <Calendar className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
            <TranslatedText contentKey="all-events-link" originalText="All Events" />
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
                    ? <TranslatedText contentKey="filtered-events-title" originalText={`${selectedFilter} Events`} />
                    : searchQuery || searchTags.length > 0
                    ? <TranslatedText contentKey="search-results-title" originalText="Search Results" />
                    : <TranslatedText contentKey="all-events-title" originalText="All Events" />
                  }
                </h2>
                {(selectedFilter || searchQuery || searchTags.length > 0 || searchFilters.dateFrom || searchFilters.dateTo) && (
                  <Button
                    onClick={() => {
                      handleFilterChange(null);
                      setSearchQuery('');
                      setSearchTags([]);
                      setSearchFilters({
                        sortBy: 'date-asc',
                        dateFrom: undefined,
                        dateTo: undefined
                      });
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
              <LoadingSpinner3D />
              <p className="mt-4 text-muted-foreground">
                <TranslatedText contentKey="loading-events" originalText="Loading events..." />
              </p>
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">
                <TranslatedText contentKey="no-events-found" originalText="No events found" />
              </h3>
              <p className="text-muted-foreground">
                {searchQuery || searchTags.length > 0 || searchFilters.dateFrom || searchFilters.dateTo
                  ? <TranslatedText contentKey="no-events-search-criteria" originalText="No events match your search criteria. Try different keywords, tags, or date ranges." />
                  : selectedFilter 
                  ? <TranslatedText contentKey="no-events-age-group" originalText={`No events available for ${selectedFilter} age group.`} />
                  : <TranslatedText contentKey="no-events-created" originalText="No events have been created yet." />
                }
              </p>
            </div>
          ) : viewMode === 'calendar' ? (
            <EventCalendar events={filteredEvents} />
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {paginatedEvents.map((event) => (
                  <EventCard3D key={event.id}>
                    <EventCard event={event} />
                  </EventCard3D>
                ))}
              </div>
              
              {/* Pagination */}
              <UserPagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={filteredEvents.length}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
              />
            </>
          )}
        </div>
      </section>
      </div>
    </>
  );
};

export default Home;