import { useState, useEffect, useRef } from 'react';
import { Search, Tag, Calendar } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
  onSearch: (query: string, selectedTags: string[]) => void;
}

const SearchBar = ({ onEventClick, onSearch }: SearchBarProps) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [tagSuggestions, setTagSuggestions] = useState<TagSuggestion[]>([]);
  const [eventSuggestions, setEventSuggestions] = useState<Event[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
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
    onSearch(query, selectedTags);
  }, [query, selectedTags, onSearch]);

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
    <div ref={searchRef} className="relative w-full max-w-2xl mx-auto">
      {/* Selected Tags */}
      {selectedTags.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {selectedTags.map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
              onClick={() => removeTag(tag)}
            >
              <Tag className="w-3 h-3 mr-1" />
              {tag}
              <span className="ml-1 text-xs">×</span>
            </Badge>
          ))}
        </div>
      )}

      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search events by name or tag..."
          className="pl-10 pr-4 py-3 text-lg"
          onFocus={() => query && setIsOpen(true)}
        />
      </div>

      {/* Suggestions Dropdown */}
      {isOpen && (query.length > 0 || selectedTags.length > 0) && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-background border rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
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
                    <span className="flex items-center">
                      <Tag className="w-3 h-3 mr-2 text-muted-foreground" />
                      {suggestion.tag}
                    </span>
                    <Badge variant="outline" className="text-xs">
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
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium">{event.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(event.event_date)} • {event.location}
                        </p>
                      </div>
                      <Badge variant="outline" className="text-xs">
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
              <p>No results found for "{query}"</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;