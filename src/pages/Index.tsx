import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Home from './Home';
// import SpecialEventPage from '@/components/SpecialEventPage';
import { supabase } from '@/integrations/supabase/client';

const Index = () => {
  const [activeSpecialEvent, setActiveSpecialEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showSpecialEvent, setShowSpecialEvent] = useState(false);

  useEffect(() => {
    checkForActiveSpecialEvent();
  }, []);

  const checkForActiveSpecialEvent = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('special_events')
        .select('*')
        .eq('is_active', true)
        .maybeSingle();

      if (error) {
        console.error('Error fetching special event:', error);
        setActiveSpecialEvent(null);
        setShowSpecialEvent(false);
      } else if (data) {
        setActiveSpecialEvent(data);
        setShowSpecialEvent(true);
      } else {
        setActiveSpecialEvent(null);
        setShowSpecialEvent(false);
      }
    } catch (error) {
      console.error('Error in checkForActiveSpecialEvent:', error);
      setActiveSpecialEvent(null);
      setShowSpecialEvent(false);
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

  // Temporarily always show Home to isolate TooltipProvider issue
  return (
    <>
      <Navbar />
      <Home />
      {showSpecialEvent && activeSpecialEvent && (
        <div className="fixed top-4 right-4 z-50">
          <div className="bg-card border rounded-lg p-4 shadow-lg">
            <p className="text-sm text-muted-foreground mb-2">
              Special Event Available: {activeSpecialEvent.title}
            </p>
            <button 
              onClick={handleExitSpecialEvent}
              className="text-xs text-primary hover:underline"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Index;
