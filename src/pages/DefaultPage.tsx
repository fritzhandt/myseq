import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import SpecialEventPage from '@/components/SpecialEventPage';
import Home from './Home';

interface SpecialEvent {
  id: string;
  title: string;
  description: string | null;
}

const DefaultPage = () => {
  const [activeSpecialEvent, setActiveSpecialEvent] = useState<SpecialEvent | null>(null);
  const [hasExitedSpecialEvent, setHasExitedSpecialEvent] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    checkForActiveSpecialEvent();
  }, []);

  const checkForActiveSpecialEvent = async () => {
    try {
      const { data, error } = await supabase
        .from('special_events')
        .select('id, title, description')
        .eq('is_active', true)
        .maybeSingle();

      if (error) {
        console.error('Error checking for active special event:', error);
        setActiveSpecialEvent(null);
      } else {
        setActiveSpecialEvent(data);
      }
    } catch (error) {
      console.error('Error checking for active special event:', error);
      setActiveSpecialEvent(null);
    } finally {
      setLoading(false);
    }
  };

  const handleExitSpecialEvent = () => {
    setHasExitedSpecialEvent(true);
  };

  const handleGoToSpecialEvent = () => {
    setHasExitedSpecialEvent(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (activeSpecialEvent && !hasExitedSpecialEvent) {
    return <SpecialEventPage onExit={handleExitSpecialEvent} />;
  }

  return (
    <Home 
      activeSpecialEvent={activeSpecialEvent} 
      onGoToSpecialEvent={handleGoToSpecialEvent}
    />
  );
};

export default DefaultPage;