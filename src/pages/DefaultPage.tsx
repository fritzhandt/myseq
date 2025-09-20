import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import SpecialEventPage from '@/components/SpecialEventPage';
import Home from './Home';

const DefaultPage = () => {
  const [hasActiveSpecialEvent, setHasActiveSpecialEvent] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    checkForActiveSpecialEvent();
  }, []);

  const checkForActiveSpecialEvent = async () => {
    try {
      const { data, error } = await supabase
        .from('special_events')
        .select('id')
        .eq('is_active', true)
        .maybeSingle();

      if (error) {
        console.error('Error checking for active special event:', error);
        setHasActiveSpecialEvent(false);
      } else {
        setHasActiveSpecialEvent(!!data);
      }
    } catch (error) {
      console.error('Error checking for active special event:', error);
      setHasActiveSpecialEvent(false);
    } finally {
      setLoading(false);
    }
  };

  const handleExitSpecialEvent = () => {
    setHasActiveSpecialEvent(false);
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

  if (hasActiveSpecialEvent) {
    return <SpecialEventPage onExit={handleExitSpecialEvent} />;
  }

  return <Home />;
};

export default DefaultPage;