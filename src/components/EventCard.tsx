import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Clock, Users, Download, Mail, ChevronDown, ChevronUp } from 'lucide-react';

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
}

interface EventCardProps {
  event: Event;
}

export const EventCard = ({ event }: EventCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const formatDate = (dateString: string) => {
    // Parse date string as local date to avoid timezone conversion issues
    const [year, month, day] = dateString.split('-').map(Number);
    const localDate = new Date(year, month - 1, day); // month is 0-indexed
    
    return localDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
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

  const truncateDescription = (text: string, length: number = 150) => {
    return text.length > length ? text.substring(0, length) + '...' : text;
  };

  const generateCalendarFile = () => {
    const eventDateTime = new Date(`${event.event_date}T${event.event_time}`);
    const endDateTime = new Date(eventDateTime.getTime() + 2 * 60 * 60 * 1000); // +2 hours
    
  const formatICSDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${year}${month}${day}T${hours}${minutes}${seconds}`;
  };

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Event Calendar//EN',
      'BEGIN:VEVENT',
      `UID:${event.id}@events.com`,
      `DTSTART:${formatICSDate(eventDateTime)}`,
      `DTEND:${formatICSDate(endDateTime)}`,
      `SUMMARY:${event.title}`,
      `DESCRIPTION:${event.description.replace(/\n/g, '\\n')}`,
      `LOCATION:${event.location}`,
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\n');

    const blob = new Blob([icsContent], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${event.title.replace(/\s+/g, '-').toLowerCase()}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const emailCalendarInvite = () => {
    const subject = encodeURIComponent(`Event: ${event.title}`);
    const body = encodeURIComponent(
      `You're invited to: ${event.title}\n\n` +
      `Date: ${formatDate(event.event_date)}\n` +
      `Time: ${formatTime(event.event_time)}\n` +
      `Location: ${event.location}\n\n` +
      `Description: ${event.description}\n\n` +
      `Elected Officials: ${event.elected_officials.join(', ')}`
    );
    window.open(`mailto:?subject=${subject}&body=${body}`);
  };

  return (
    <Card className="shadow-card hover:shadow-elegant transition-all duration-300 overflow-hidden">
      {event.cover_photo_url && (
        <div className="relative h-48 overflow-hidden">
          <img
            src={event.cover_photo_url}
            alt={event.title}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          />
          <Badge className="absolute top-3 right-3 bg-primary/90 backdrop-blur-sm">
            <Users className="w-3 h-3 mr-1" />
            {event.age_group}
          </Badge>
        </div>
      )}
      
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start gap-2">
          <CardTitle className="text-xl leading-tight">{event.title}</CardTitle>
          {!event.cover_photo_url && (
            <Badge variant="secondary">
              <Users className="w-3 h-3 mr-1" />
              {event.age_group}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-3">
          <div className="flex items-center text-sm text-muted-foreground">
            <Calendar className="w-4 h-4 mr-2 text-primary" />
            {formatDate(event.event_date)}
          </div>
          <div className="flex items-center text-sm text-muted-foreground">
            <Clock className="w-4 h-4 mr-2 text-primary" />
            {formatTime(event.event_time)}
          </div>
          <div className="flex items-center text-sm text-muted-foreground">
            <MapPin className="w-4 h-4 mr-2 text-primary" />
            {event.location}
          </div>
        </div>

        <p className="text-sm">
          {isExpanded ? event.description : truncateDescription(event.description)}
        </p>

        {event.elected_officials.length > 0 && (
          <div className="space-y-2">
            <p className="font-medium text-sm">Sponsored by:</p>
            <div className="flex flex-wrap gap-1">
              {event.elected_officials.map((official, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {official}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {event.description.length > 150 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full justify-center"
          >
            {isExpanded ? (
              <>
                Show Less <ChevronUp className="w-4 h-4 ml-1" />
              </>
            ) : (
              <>
                Read More <ChevronDown className="w-4 h-4 ml-1" />
              </>
            )}
          </Button>
        )}

        <div className="flex gap-2 pt-2">
          <Button
            onClick={generateCalendarFile}
            variant="outline"
            size="sm"
            className="flex-1"
          >
            <Download className="w-4 h-4 mr-1" />
            Add to Calendar
          </Button>
          <Button
            onClick={emailCalendarInvite}
            variant="outline"
            size="sm"
            className="flex-1"
          >
            <Mail className="w-4 h-4 mr-1" />
            Email Invite
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};