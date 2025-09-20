import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Clock, Users, Download, Mail, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

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
}

interface EventCardProps {
  event: Event;
}

export const EventCard = ({ event }: EventCardProps) => {
  const navigate = useNavigate();
  
  // Format date for display

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
        <div className="relative h-40 sm:h-48 overflow-hidden">
          <img
            src={event.cover_photo_url}
            alt={event.title}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute top-2 sm:top-3 right-2 sm:right-3 flex flex-wrap gap-1">
            {event.age_group.map((group, index) => (
              <Badge key={index} className="bg-primary/90 backdrop-blur-sm text-xs">
                <Users className="w-3 h-3 mr-1" />
                {group}
              </Badge>
            ))}
          </div>
        </div>
      )}
      
      <CardHeader className="pb-3 px-4 sm:px-6">
        <div className="flex justify-between items-start gap-2">
          <CardTitle className="text-lg sm:text-xl leading-tight">{event.title}</CardTitle>
          {!event.cover_photo_url && (
            <div className="flex flex-wrap gap-1">
              {event.age_group.map((group, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  <Users className="w-3 h-3 mr-1" />
                  {group}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4 px-4 sm:px-6">
        <div className="grid grid-cols-1 gap-3">
          <div className="flex items-center text-sm text-muted-foreground">
            <Calendar className="w-4 h-4 mr-2 text-primary flex-shrink-0" />
            <span className="truncate">{formatDate(event.event_date)}</span>
          </div>
          <div className="flex items-center text-sm text-muted-foreground">
            <Clock className="w-4 h-4 mr-2 text-primary flex-shrink-0" />
            {formatTime(event.event_time)}
          </div>
          <div className="flex items-center text-sm text-muted-foreground">
            <MapPin className="w-4 h-4 mr-2 text-primary flex-shrink-0" />
            <span className="truncate">{event.location}</span>
          </div>
        </div>

        <p className="text-sm">
          {truncateDescription(event.description)}
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
            onClick={() => navigate(`/event/${event.id}`)}
            className="w-full justify-center px-2"
          >
            <span className="truncate">Learn More</span>
            <ExternalLink className="w-4 h-4 ml-1 flex-shrink-0" />
          </Button>
        )}

        <div className="flex flex-col gap-2 pt-2 w-full">
          <Button
            onClick={generateCalendarFile}
            variant="outline"
            className="w-full text-xs sm:text-sm h-12 sm:h-10"
          >
            <Download className="w-4 h-4 mr-1 flex-shrink-0" />
            Add to Calendar
          </Button>
          <Button
            onClick={emailCalendarInvite}
            variant="outline"
            className="w-full text-xs sm:text-sm h-12 sm:h-10"
          >
            <Mail className="w-4 h-4 mr-1 flex-shrink-0" />
            Email Invite
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};