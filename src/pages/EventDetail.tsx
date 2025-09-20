import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { Calendar, Clock, MapPin, Users, ArrowLeft, Tag, Download, Mail, ChevronLeft, ChevronRight, X } from 'lucide-react';
import Navbar from '@/components/Navbar';

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

const EventDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);

  const openGallery = (index: number) => {
    setSelectedImageIndex(index);
    setIsGalleryOpen(true);
  };

  const closeGallery = () => {
    setIsGalleryOpen(false);
    setSelectedImageIndex(null);
  };

  const navigateImage = (direction: 'prev' | 'next') => {
    if (!event || !event.additional_images || selectedImageIndex === null) return;
    
    const totalImages = event.additional_images.length;
    let newIndex;
    
    if (direction === 'prev') {
      newIndex = selectedImageIndex === 0 ? totalImages - 1 : selectedImageIndex - 1;
    } else {
      newIndex = selectedImageIndex === totalImages - 1 ? 0 : selectedImageIndex + 1;
    }
    
    setSelectedImageIndex(newIndex);
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (!isGalleryOpen) return;
    
    if (e.key === 'Escape') {
      closeGallery();
    } else if (e.key === 'ArrowLeft') {
      navigateImage('prev');
    } else if (e.key === 'ArrowRight') {
      navigateImage('next');
    }
  };

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isGalleryOpen, selectedImageIndex]);

  useEffect(() => {
    if (id) {
      fetchEvent();
    }
  }, [id]);

  const fetchEvent = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      
      if (!data) {
        setError('Event not found');
      } else {
        setEvent(data);
      }
    } catch (error) {
      console.error('Error fetching event:', error);
      setError('Failed to load event');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(':');
    const date = new Date();
    date.setHours(parseInt(hours), parseInt(minutes));
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const generateCalendarFile = () => {
    if (!event) return;
    
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
    if (!event) return;
    
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

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-background py-16">
          <div className="container mx-auto px-4">
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <p className="mt-4 text-muted-foreground">Loading event...</p>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (error || !event) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-background py-16">
          <div className="container mx-auto px-4">
            <div className="text-center py-12">
              <h1 className="text-2xl font-bold mb-4">Event Not Found</h1>
              <p className="text-muted-foreground mb-6">{error || 'The event you\'re looking for doesn\'t exist.'}</p>
              <Link to="/">
                <Button>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Events
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <div className="relative">
          {event.cover_photo_url && (
            <div className="h-64 md:h-80 bg-muted">
              <img
                src={event.cover_photo_url}
                alt={event.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/40" />
            </div>
          )}
          
          <div className="absolute top-4 left-4">
            <Link to="/">
              <Button variant="secondary" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Events
              </Button>
            </Link>
          </div>
        </div>

        {/* Event Details */}
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-card rounded-lg border p-6 md:p-8 -mt-16 relative z-10 shadow-lg">
              {/* Title and Age Group */}
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold mb-2">{event.title}</h1>
                  <Badge variant="secondary" className="w-fit">
                    <Users className="w-4 h-4 mr-1" />
                    {event.age_group}
                  </Badge>
                </div>
                <Button onClick={generateCalendarFile} size="lg">
                  <Calendar className="w-4 h-4 mr-2" />
                  Add to Calendar
                </Button>
              </div>

              {/* Event Info */}
              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div className="flex items-center text-muted-foreground">
                  <Calendar className="w-5 h-5 mr-3 text-primary" />
                  <div>
                    <p className="font-medium text-foreground">{formatDate(event.event_date)}</p>
                  </div>
                </div>
                <div className="flex items-center text-muted-foreground">
                  <Clock className="w-5 h-5 mr-3 text-primary" />
                  <div>
                    <p className="font-medium text-foreground">{formatTime(event.event_time)}</p>
                  </div>
                </div>
                <div className="flex items-center text-muted-foreground">
                  <MapPin className="w-5 h-5 mr-3 text-primary" />
                  <div>
                    <p className="font-medium text-foreground">{event.location}</p>
                  </div>
                </div>
              </div>

              {/* Tags */}
              {event.tags && event.tags.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-lg font-semibold mb-3 flex items-center">
                    <Tag className="w-5 h-5 mr-2" />
                    Tags
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {event.tags.map((tag, index) => (
                      <Badge key={index} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Description */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-3">About This Event</h3>
                <div className="prose prose-lg max-w-none">
                  <p className="text-muted-foreground whitespace-pre-wrap">{event.description}</p>
                </div>
              </div>

              {/* Elected Officials */}
              {event.elected_officials && event.elected_officials.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-lg font-semibold mb-3">Participating Officials</h3>
                  <div className="flex flex-wrap gap-2">
                    {event.elected_officials.map((official, index) => (
                      <Badge key={index} variant="secondary">
                        {official}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Additional Images */}
              {event.additional_images && event.additional_images.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-lg font-semibold mb-3">Event Photos</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {event.additional_images.map((image, index) => (
                      <img
                        key={index}
                        src={image}
                        alt={`${event.title} - Image ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg bg-muted cursor-pointer hover:opacity-80 transition-opacity duration-200 hover-scale"
                        onClick={() => openGallery(index)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Image Gallery Modal */}
              <Dialog open={isGalleryOpen} onOpenChange={setIsGalleryOpen}>
                <DialogContent className="max-w-4xl w-full h-[80vh] p-0 overflow-hidden">
                  <div className="relative w-full h-full bg-black/90 flex items-center justify-center">
                    {/* Close Button */}
                    <button
                      onClick={closeGallery}
                      className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                    >
                      <X className="w-6 h-6" />
                    </button>

                    {/* Navigation Buttons */}
                    {event && event.additional_images && event.additional_images.length > 1 && (
                      <>
                        <button
                          onClick={() => navigateImage('prev')}
                          className="absolute left-4 z-10 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                        >
                          <ChevronLeft className="w-6 h-6" />
                        </button>
                        <button
                          onClick={() => navigateImage('next')}
                          className="absolute right-4 z-10 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                        >
                          <ChevronRight className="w-6 h-6" />
                        </button>
                      </>
                    )}

                    {/* Image */}
                    {event && event.additional_images && selectedImageIndex !== null && (
                      <div className="relative w-full h-full flex items-center justify-center p-8">
                        <img
                          src={event.additional_images[selectedImageIndex]}
                          alt={`${event.title} - Image ${selectedImageIndex + 1}`}
                          className="max-w-full max-h-full object-contain animate-scale-in"
                        />
                        
                        {/* Image Counter */}
                        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 px-3 py-1 bg-black/50 text-white text-sm rounded-full">
                          {selectedImageIndex + 1} / {event.additional_images.length}
                        </div>
                      </div>
                    )}
                  </div>
                </DialogContent>
              </Dialog>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-6 border-t">
                <Button
                  onClick={generateCalendarFile}
                  variant="outline"
                  className="flex-1"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Add to Calendar
                </Button>
                <Button
                  onClick={emailCalendarInvite}
                  variant="outline"
                  className="flex-1"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Email Invite
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default EventDetail;