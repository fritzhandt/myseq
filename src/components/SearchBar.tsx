import { useState, useEffect, useRef } from 'react';
import { Search, Tag, Calendar, Filter, ChevronDown, ChevronUp } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';

interface Event {
  id: string;
  title: string;
  description: string;
  location: string;
  event_date: string;
  event_time: string;
  age_group: string;
  tags: string[];
  cover_photo_url: string | null;
}

interface TagSuggestion {
  tag: string;
  count: number;
}

interface SearchBarProps {
  onEventClick: (eventId: string) => void;
  onSearch: (query: string, selectedTags: string[], filters: SearchFilters) => void;
}

interface SearchFilters {
  sortBy: 'date-asc' | 'date-desc';
  dateFrom?: Date;
  dateTo?: Date;
}

const SearchBar = ({ onEventClick, onSearch }: SearchBarProps) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [tagSuggestions, setTagSuggestions] = useState<TagSuggestion[]>([]);
  const [eventSuggestions, setEventSuggestions] = useState<Event[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'date-asc' | 'date-desc'>('date-asc');
  const [dateFrom, setDateFrom] = useState<Date | undefined>();
  const [dateTo, setDateTo] = useState<Date | undefined>();
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (query.length > 0) {
      searchSuggestions();
      setIsOpen(true);
    } else {
      setTagSuggestions([]);
      setEventSuggestions([]);
      setIsOpen(false);
    }
  }, [query]);

  useEffect(() => {
    // Don't trigger automatic search - only when user hits submit
  }, [query, selectedTags]);

  const handleSubmit = () => {
    const filters: SearchFilters = {
      sortBy,
      dateFrom,
      dateTo
    };
    onSearch(query, selectedTags, filters);
    setIsOpen(false);
  };

  const searchSuggestions = async () => {
    try {
      // Search for events that match the query in title or description
      const { data: events } = await supabase
        .from('events')
        .select('*')
        .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
        .order('event_date', { ascending: true })
        .limit(5);

      if (events) {
        setEventSuggestions(events);
      }

      // Get all tags that contain the query and count occurrences
      const { data: allEvents } = await supabase
        .from('events')
        .select('tags');

      if (allEvents) {
        const tagCounts: { [key: string]: number } = {};
        
        allEvents.forEach(event => {
          event.tags?.forEach((tag: string) => {
            if (tag.toLowerCase().includes(query.toLowerCase())) {
              tagCounts[tag] = (tagCounts[tag] || 0) + 1;
            }
          });
        });

        const suggestions = Object.entries(tagCounts)
          .map(([tag, count]) => ({ tag, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5);

        setTagSuggestions(suggestions);
      }
    } catch (error) {
      console.error('Error searching:', error);
    }
  };

  const handleTagClick = (tag: string) => {
    if (!selectedTags.includes(tag)) {
      setSelectedTags([...selectedTags, tag]);
    }
    setQuery('');
    setIsOpen(false);
  };

  const removeTag = (tagToRemove: string) => {
    setSelectedTags(selectedTags.filter(tag => tag !== tagToRemove));
  };

  const handleEventClick = (eventId: string) => {
    onEventClick(eventId);
    setIsOpen(false);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div ref={searchRef} className="relative w-full max-w-4xl mx-auto">
      {/* Selected Tags */}
      {selectedTags.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-1 sm:gap-2">
          {selectedTags.map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground text-xs sm:text-sm"
              onClick={() => removeTag(tag)}
            >
              <Tag className="w-3 h-3 mr-1" />
              <span className="truncate max-w-[100px] sm:max-w-none">{tag}</span>
              <span className="ml-1 text-xs">×</span>
            </Badge>
          ))}
        </div>
      )}

      {/* Search Input and Controls */}
      <div className="bg-card border rounded-lg p-4 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search events by name or tag..."
              className="pl-10 pr-4 py-2 sm:py-3 text-base"
              onFocus={() => query && setIsOpen(true)}
            />
          </div>
          
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="whitespace-nowrap"
            >
              <Filter className="w-4 h-4 mr-2" />
              Advanced
              {showAdvanced ? <ChevronUp className="w-4 h-4 ml-2" /> : <ChevronDown className="w-4 h-4 ml-2" />}
            </Button>
            
            <Button onClick={handleSubmit} className="whitespace-nowrap">
              Search
            </Button>
          </div>
        </div>

        {/* Advanced Filters */}
        {showAdvanced && (
          <div className="mt-4 pt-4 border-t space-y-4">
            <div className="text-sm text-muted-foreground mb-3">
              <p>Advanced filters will work with your search terms above. Leave search blank to filter all events.</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Sort By */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Sort by Date</label>
                <Select value={sortBy} onValueChange={(value: 'date-asc' | 'date-desc') => setSortBy(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date-asc">Soonest to Latest</SelectItem>
                    <SelectItem value="date-desc">Latest to Soonest</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Date From */}
              <div className="space-y-2">
                <label className="text-sm font-medium">From Date</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !dateFrom && "text-muted-foreground"
                      )}
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {dateFrom ? format(dateFrom, "MMM dd, yyyy") : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={dateFrom}
                      onSelect={setDateFrom}
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Date To */}
              <div className="space-y-2">
                <label className="text-sm font-medium">To Date</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !dateTo && "text-muted-foreground"
                      )}
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {dateTo ? format(dateTo, "MMM dd, yyyy") : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={dateTo}
                      onSelect={setDateTo}
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Clear Filters */}
            <div className="flex justify-end">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSortBy('date-asc');
                  setDateFrom(undefined);
                  setDateTo(undefined);
                }}
              >
                Clear Advanced Filters
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Suggestions Dropdown */}
      {isOpen && (query.length > 0 || selectedTags.length > 0) && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-background border rounded-lg shadow-lg z-50 max-h-[70vh] sm:max-h-96 overflow-y-auto">
          {/* Tag Suggestions */}
          {tagSuggestions.length > 0 && (
            <div className="p-3 border-b">
              <h4 className="text-sm font-medium text-muted-foreground mb-2 flex items-center">
                <Tag className="w-4 h-4 mr-1" />
                Tags
              </h4>
              <div className="space-y-1">
                {tagSuggestions.map((suggestion) => (
                  <button
                    key={suggestion.tag}
                    onClick={() => handleTagClick(suggestion.tag)}
                    className="w-full text-left px-3 py-2 rounded-md hover:bg-muted text-sm flex items-center justify-between"
                  >
                    <span className="flex items-center min-w-0">
                      <Tag className="w-3 h-3 mr-2 text-muted-foreground flex-shrink-0" />
                      <span className="truncate">{suggestion.tag}</span>
                    </span>
                    <Badge variant="outline" className="text-xs ml-2 flex-shrink-0">
                      {suggestion.count} event{suggestion.count !== 1 ? 's' : ''}
                    </Badge>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Event Suggestions */}
          {eventSuggestions.length > 0 && (
            <div className="p-3">
              <h4 className="text-sm font-medium text-muted-foreground mb-2 flex items-center">
                <Calendar className="w-4 h-4 mr-1" />
                Events
              </h4>
              <div className="space-y-1">
                {eventSuggestions.map((event) => (
                  <button
                    key={event.id}
                    onClick={() => handleEventClick(event.id)}
                    className="w-full text-left px-3 py-2 rounded-md hover:bg-muted text-sm"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="font-medium truncate">{event.title}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {formatDate(event.event_date)} • {event.location}
                        </p>
                      </div>
                      <Badge variant="outline" className="text-xs flex-shrink-0">
                        {event.age_group}
                      </Badge>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* No Results */}
          {query && tagSuggestions.length === 0 && eventSuggestions.length === 0 && (
            <div className="p-6 text-center text-muted-foreground">
              <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No results found for "{query}"</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;