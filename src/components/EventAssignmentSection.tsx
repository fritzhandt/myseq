import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { BookOpen, GraduationCap, Briefcase, Crown, ChevronDown } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Calendar, MapPin, Clock, Users, Plus, X, Upload, Tag, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

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

interface SpecialEventDay {
  date: string;
  title?: string;
  description?: string;
  events: EventData[];
}

interface EventAssignmentSectionProps {
  days: SpecialEventDay[];
  onUpdateDays: (days: SpecialEventDay[]) => void;
  type: 'single_day' | 'multi_day';
}

const ageGroups = ['Grade School', 'Young Adult', 'Adult', 'Senior'];
const ageGroupIcons = {
  'Grade School': BookOpen,
  'Young Adult': GraduationCap,
  'Adult': Briefcase,
  'Senior': Crown
};

export const EventAssignmentSection = ({ days, onUpdateDays, type }: EventAssignmentSectionProps) => {
  const [newTag, setNewTag] = useState<{[key: string]: string}>({});
  const [newOfficial, setNewOfficial] = useState<{[key: string]: string}>({});
  const { toast } = useToast();

  const createEmptyEvent = (): EventData => ({
    title: '',
    description: '',
    location: '',
    event_time: '',
    age_group: [],
    elected_officials: [],
    tags: [],
    cover_photo_url: null,
    additional_images: [],
    cover_photo_file: null,
    additional_image_files: []
  });

  const addEventToDay = (dayIndex: number) => {
    const updatedDays = days.map((day, index) => {
      if (index === dayIndex) {
        return { ...day, events: [...(day.events || []), createEmptyEvent()] };
      }
      return day;
    });
    onUpdateDays(updatedDays);
  };

  const removeEventFromDay = (dayIndex: number, eventIndex: number) => {
    const updatedDays = days.map((day, index) => {
      if (index === dayIndex) {
        return { ...day, events: (day.events || []).filter((_, i) => i !== eventIndex) };
      }
      return day;
    });
    onUpdateDays(updatedDays);
  };

  const updateEventInDay = (dayIndex: number, eventIndex: number, field: keyof EventData, value: any) => {
    console.log('Updating event field:', field, 'with value:', value, 'for day:', dayIndex, 'event:', eventIndex);
    const updatedDays = days.map((day, index) => {
      if (index === dayIndex) {
        const updatedEvents = (day.events || []).map((event, i) => {
          if (i === eventIndex) {
            const updatedEvent = { ...event, [field]: value };
            console.log('Updated event:', updatedEvent);
            return updatedEvent;
          }
          return event;
        });
        return { ...day, events: updatedEvents };
      }
      return day;
    });
    console.log('Calling onUpdateDays with:', updatedDays);
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

  const addTag = (dayIndex: number, eventIndex: number, tag: string) => {
    if (tag.trim()) {
      const currentEvent = days[dayIndex]?.events?.[eventIndex];
      console.log('Adding tag:', tag, 'to event:', currentEvent);
      if (currentEvent && !currentEvent.tags.includes(tag.trim())) {
        const newTags = [...currentEvent.tags, tag.trim()];
        console.log('New tags array:', newTags);
        updateEventInDay(dayIndex, eventIndex, 'tags', newTags);
      } else {
        console.log('Tag already exists or event not found');
      }
    }
  };

  const removeTag = (dayIndex: number, eventIndex: number, tagToRemove: string) => {
    const currentEvent = days[dayIndex]?.events?.[eventIndex];
    if (currentEvent) {
      updateEventInDay(dayIndex, eventIndex, 'tags', currentEvent.tags.filter(tag => tag !== tagToRemove));
    }
  };

  const addElectedOfficial = (dayIndex: number, eventIndex: number, official: string) => {
    if (official.trim()) {
      const currentEvent = days[dayIndex]?.events?.[eventIndex];
      console.log('Adding elected official:', official, 'to event:', currentEvent);
      if (currentEvent && !currentEvent.elected_officials.includes(official.trim())) {
        const newOfficials = [...currentEvent.elected_officials, official.trim()];
        console.log('New elected officials array:', newOfficials);
        updateEventInDay(dayIndex, eventIndex, 'elected_officials', newOfficials);
      } else {
        console.log('Official already exists or event not found');
      }
    }
  };

  const removeElectedOfficial = (dayIndex: number, eventIndex: number, officialToRemove: string) => {
    const currentEvent = days[dayIndex]?.events?.[eventIndex];
    if (currentEvent) {
      updateEventInDay(dayIndex, eventIndex, 'elected_officials', currentEvent.elected_officials.filter(official => official !== officialToRemove));
    }
  };

  const handleFileUpload = (dayIndex: number, eventIndex: number, file: File, type: 'cover' | 'additional') => {
    if (type === 'cover') {
      updateEventInDay(dayIndex, eventIndex, 'cover_photo_file', file);
    } else {
      const currentEvent = days[dayIndex]?.events?.[eventIndex];
      if (currentEvent) {
        updateEventInDay(dayIndex, eventIndex, 'additional_image_files', [...currentEvent.additional_image_files, file]);
      }
    }
  };

  return (
    <div className="space-y-6">
      {days.map((day, dayIndex) => (
        <Card key={dayIndex} className="border-2">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg">
                {format(new Date(day.date), 'EEEE, MMMM d, yyyy')}
              </CardTitle>
              <Button onClick={() => addEventToDay(dayIndex)} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Event
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
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

            {/* Events for this day */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label className="text-base font-semibold">Events for this day:</Label>
                <span className="text-sm text-muted-foreground">
                  {(day.events || []).length} event{(day.events || []).length !== 1 ? 's' : ''}
                </span>
              </div>
              
              {(day.events || []).length === 0 ? (
                <Card>
                  <CardContent className="text-center py-8">
                    <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
                    <h4 className="text-lg font-semibold mb-2">No events yet</h4>
                    <p className="text-muted-foreground mb-4">
                      Add an event for this day to get started!
                    </p>
                    <Button onClick={() => addEventToDay(dayIndex)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add First Event
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                (day.events || []).map((event, eventIndex) => (
                  <Card key={eventIndex} className="border-l-4 border-l-primary">
                    <CardHeader className="pb-4">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">Event #{eventIndex + 1}</CardTitle>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeEventFromDay(dayIndex, eventIndex)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Basic Event Info */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label>Event Title *</Label>
                          <Input
                            value={event.title}
                            onChange={(e) => updateEventInDay(dayIndex, eventIndex, 'title', e.target.value)}
                            placeholder="Enter event title"
                          />
                        </div>
                        <div>
                          <Label>Event Time *</Label>
                          <Input
                            type="time"
                            value={event.event_time}
                            onChange={(e) => updateEventInDay(dayIndex, eventIndex, 'event_time', e.target.value)}
                          />
                        </div>
                      </div>

                      <div>
                        <Label>Location *</Label>
                        <Input
                          value={event.location}
                          onChange={(e) => updateEventInDay(dayIndex, eventIndex, 'location', e.target.value)}
                          placeholder="Enter event location"
                        />
                      </div>

                      <div>
                        <Label>Description *</Label>
                        <Textarea
                          value={event.description}
                          onChange={(e) => updateEventInDay(dayIndex, eventIndex, 'description', e.target.value)}
                          placeholder="Describe the event"
                          rows={3}
                        />
                      </div>

                      <div>
                        <Label>Age Groups *</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className="w-full justify-between"
                              type="button"
                            >
                              {event.age_group.length > 0
                                ? `${event.age_group.length} group${event.age_group.length > 1 ? 's' : ''} selected`
                                : 'Select age groups'
                              }
                              <ChevronDown className="h-4 w-4 opacity-50" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-full p-4">
                            <div className="space-y-3">
                              {ageGroups.map((group) => {
                                const IconComponent = ageGroupIcons[group as keyof typeof ageGroupIcons];
                                return (
                                  <div key={group} className="flex items-center space-x-2">
                                    <Checkbox
                                      id={`age-group-${dayIndex}-${eventIndex}-${group}`}
                                      checked={event.age_group.includes(group)}
                                      onCheckedChange={(checked) => {
                                        const currentAgeGroups = [...event.age_group];
                                        if (checked) {
                                          updateEventInDay(dayIndex, eventIndex, 'age_group', [...currentAgeGroups, group]);
                                        } else {
                                          updateEventInDay(dayIndex, eventIndex, 'age_group', currentAgeGroups.filter(g => g !== group));
                                        }
                                      }}
                                    />
                                    <Label 
                                      htmlFor={`age-group-${dayIndex}-${eventIndex}-${group}`}
                                      className="text-sm font-normal cursor-pointer flex items-center"
                                    >
                                      <IconComponent className="w-4 h-4 mr-2" />
                                      {group}
                                    </Label>
                                  </div>
                                );
                              })}
                            </div>
                          </PopoverContent>
                        </Popover>
                      </div>

                      {/* Tags */}
                      <div>
                        <Label>Tags</Label>
                        <div className="flex flex-wrap gap-2 mb-2">
                          {event.tags.map((tag, tagIndex) => (
                            <Badge key={tagIndex} variant="secondary" className="flex items-center gap-1">
                              <Tag className="w-3 h-3" />
                              {tag}
                              <X 
                                className="w-3 h-3 cursor-pointer hover:text-destructive" 
                                onClick={() => removeTag(dayIndex, eventIndex, tag)}
                              />
                            </Badge>
                          ))}
                        </div>
                         <div className="flex gap-2">
                           <Input
                             placeholder="Add a tag"
                             value={newTag[`${dayIndex}-${eventIndex}`] || ''}
                             onChange={(e) => setNewTag(prev => ({...prev, [`${dayIndex}-${eventIndex}`]: e.target.value}))}
                             onKeyDown={(e) => {
                               if (e.key === 'Enter') {
                                 e.preventDefault();
                                 const tagValue = newTag[`${dayIndex}-${eventIndex}`] || '';
                                 if (tagValue.trim()) {
                                   addTag(dayIndex, eventIndex, tagValue);
                                   setNewTag(prev => ({...prev, [`${dayIndex}-${eventIndex}`]: ''}));
                                 }
                               }
                             }}
                           />
                           <Button 
                             type="button"
                             variant="outline" 
                             size="sm"
                             onClick={() => {
                               const tagValue = newTag[`${dayIndex}-${eventIndex}`] || '';
                               if (tagValue.trim()) {
                                 addTag(dayIndex, eventIndex, tagValue);
                                 setNewTag(prev => ({...prev, [`${dayIndex}-${eventIndex}`]: ''}));
                               }
                             }}
                           >
                             <Plus className="w-4 h-4" />
                           </Button>
                         </div>
                      </div>

                      {/* Elected Officials */}
                      <div>
                        <Label>Elected Officials</Label>
                        <div className="flex flex-wrap gap-2 mb-2">
                          {event.elected_officials.map((official, officialIndex) => (
                            <Badge key={officialIndex} variant="outline" className="flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              {official}
                              <X 
                                className="w-3 h-3 cursor-pointer hover:text-destructive" 
                                onClick={() => removeElectedOfficial(dayIndex, eventIndex, official)}
                              />
                            </Badge>
                          ))}
                        </div>
                         <div className="flex gap-2">
                           <Input
                             placeholder="Add elected official"
                             value={newOfficial[`${dayIndex}-${eventIndex}`] || ''}
                             onChange={(e) => setNewOfficial(prev => ({...prev, [`${dayIndex}-${eventIndex}`]: e.target.value}))}
                             onKeyDown={(e) => {
                               if (e.key === 'Enter') {
                                 e.preventDefault();
                                 const officialValue = newOfficial[`${dayIndex}-${eventIndex}`] || '';
                                 if (officialValue.trim()) {
                                   addElectedOfficial(dayIndex, eventIndex, officialValue);
                                   setNewOfficial(prev => ({...prev, [`${dayIndex}-${eventIndex}`]: ''}));
                                 }
                               }
                             }}
                           />
                           <Button 
                             type="button"
                             variant="outline" 
                             size="sm"
                             onClick={() => {
                               const officialValue = newOfficial[`${dayIndex}-${eventIndex}`] || '';
                               if (officialValue.trim()) {
                                 addElectedOfficial(dayIndex, eventIndex, officialValue);
                                 setNewOfficial(prev => ({...prev, [`${dayIndex}-${eventIndex}`]: ''}));
                               }
                             }}
                           >
                             <Plus className="w-4 h-4" />
                           </Button>
                         </div>
                      </div>

                      {/* Cover Photo */}
                      <div>
                        <Label>Cover Photo</Label>
                        <div className="mt-2">
                          <Input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleFileUpload(dayIndex, eventIndex, file, 'cover');
                            }}
                          />
                          {event.cover_photo_file && (
                            <div className="mt-2">
                              <img
                                src={URL.createObjectURL(event.cover_photo_file)}
                                alt="Cover preview"
                                className="w-24 h-24 object-cover rounded-md"
                              />
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Additional Images */}
                      <div>
                        <Label>Additional Images</Label>
                        <div className="mt-2">
                          <Input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={(e) => {
                              const files = Array.from(e.target.files || []);
                              files.forEach(file => handleFileUpload(dayIndex, eventIndex, file, 'additional'));
                            }}
                          />
                          {event.additional_image_files.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-2">
                              {event.additional_image_files.map((file, fileIndex) => (
                                <img
                                  key={fileIndex}
                                  src={URL.createObjectURL(file)}
                                  alt={`Additional preview ${fileIndex + 1}`}
                                  className="w-16 h-16 object-cover rounded-md"
                                />
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};