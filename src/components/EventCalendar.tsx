import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

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

interface EventCalendarProps {
  events: Event[];
}

export const EventCalendar = ({ events }: EventCalendarProps) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const navigate = useNavigate();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prevDate => {
      const newDate = new Date(prevDate);
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days = [];
    const current = new Date(startDate);

    for (let i = 0; i < 42; i++) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }

    return days;
  };

  const getEventsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return events.filter(event => event.event_date === dateStr);
  };

  const formatTime = (timeString: string) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentDate.getMonth();
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const days = getDaysInMonth(currentDate);

  return (
    <div className="bg-background rounded-lg border">
      {/* Calendar Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigateMonth('prev')}
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
        
        <h2 className="text-xl font-semibold">
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h2>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigateMonth('next')}
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Days of Week Header */}
      <div className="grid grid-cols-7 border-b">
        {daysOfWeek.map(day => (
          <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground border-r last:border-r-0">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7">
        {days.map((day, index) => {
          const dayEvents = getEventsForDate(day);
          const isInCurrentMonth = isCurrentMonth(day);
          const isTodayDate = isToday(day);

          return (
            <div
              key={index}
              className={`min-h-[120px] p-2 border-r border-b last:border-r-0 ${
                !isInCurrentMonth ? 'bg-muted/30' : ''
              } ${isTodayDate ? 'bg-primary/5 border-primary/20' : ''}`}
            >
              <div className={`text-sm font-medium mb-1 ${
                !isInCurrentMonth ? 'text-muted-foreground' : ''
              } ${isTodayDate ? 'text-primary font-bold' : ''}`}>
                {day.getDate()}
              </div>
              
              <div className="space-y-1">
                {dayEvents.slice(0, 3).map((event) => (
                  <div
                    key={event.id}
                    onClick={() => navigate(`/event/${event.id}`)}
                    className="text-xs p-1 rounded cursor-pointer hover:opacity-80 transition-opacity bg-primary/10 border border-primary/20 hover-scale"
                  >
                    <div className="font-medium truncate text-primary">
                      {event.title}
                    </div>
                    <div className="text-muted-foreground truncate">
                      {formatTime(event.event_time)}
                    </div>
                  </div>
                ))}
                
                {dayEvents.length > 3 && (
                  <div className="text-xs text-muted-foreground font-medium">
                    +{dayEvents.length - 3} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="p-4 border-t bg-muted/30">
        <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-primary/10 border border-primary/20 rounded"></div>
            <span>Events</span>
          </div>
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-4 h-4" />
            <span>Click events to view details</span>
          </div>
        </div>
      </div>
    </div>
  );
};