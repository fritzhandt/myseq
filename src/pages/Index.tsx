import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Home from './Home';
import SpecialEventPage from '@/components/SpecialEventPage';
import { supabase } from '@/integrations/supabase/client';

const Index = () => {
  const [activeSpecialEvent, setActiveSpecialEvent] = useState(null);
  const [showSpecialEvent, setShowSpecialEvent] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkForActiveSpecialEvent();
  }, []);

  const checkForActiveSpecialEvent = async () => {
    try {
      const { data, error } = await supabase
        .from('special_events')
        .select('*')
        .eq('is_active', true)
        .single();

      if (data && !error) {
        setActiveSpecialEvent(data);
        setShowSpecialEvent(true);
      }
    } catch (error) {
      // No active special event, show regular homepage
    } finally {
      setLoading(false);
    }
  };

  const handleExitSpecialEvent = () => {
    setShowSpecialEvent(false);
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

  return (
    <>
      <Navbar />
      {showSpecialEvent && activeSpecialEvent ? (
        <SpecialEventPage onExit={handleExitSpecialEvent} />
      ) : (
        <Home />
      )}
    </>
  );
};

export default Index;
