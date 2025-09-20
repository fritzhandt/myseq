import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EventForm } from '@/components/EventForm';
import { EventList } from '@/components/EventList';
import SpecialEventForm from '@/components/SpecialEventForm';
import SpecialEventsList from '@/components/SpecialEventsList';
import CommunityAlertForm from '@/components/CommunityAlertForm';
import CommunityAlertsList from '@/components/CommunityAlertsList';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Plus, Calendar, LogOut, Star, AlertTriangle } from 'lucide-react';

const Admin = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [showSpecialEventForm, setShowSpecialEventForm] = useState(false);
  const [editingSpecialEvent, setEditingSpecialEvent] = useState(null);
  const [showCommunityAlertForm, setShowCommunityAlertForm] = useState(false);
  const [editingCommunityAlert, setEditingCommunityAlert] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check authentication
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/auth');
        return;
      }
      setLoading(false);
    };

    checkAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session && event === 'SIGNED_OUT') {
        navigate('/auth');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Success",
        description: "Successfully signed out!",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleCreateEvent = () => {
    setEditingEvent(null);
    setShowForm(true);
  };

  const handleEditEvent = (event: any) => {
    setEditingEvent(event);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingEvent(null);
  };

  const handleCreateSpecialEvent = () => {
    setEditingSpecialEvent(null);
    setShowSpecialEventForm(true);
  };

  const handleEditSpecialEvent = (specialEvent: any) => {
    setEditingSpecialEvent(specialEvent);
    setShowSpecialEventForm(true);
  };

  const handleSpecialEventFormClose = () => {
    setShowSpecialEventForm(false);
    setEditingSpecialEvent(null);
  };

  const handleCreateCommunityAlert = () => {
    setEditingCommunityAlert(null);
    setShowCommunityAlertForm(true);
  };

  const handleEditCommunityAlert = (alert: any) => {
    setEditingCommunityAlert(alert);
    setShowCommunityAlertForm(true);
  };

  const handleCommunityAlertFormClose = () => {
    setShowCommunityAlertForm(false);
    setEditingCommunityAlert(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
          <p className="text-muted-foreground">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Calendar className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold">Event Admin Panel</h1>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => navigate('/')} variant="outline">
                <Calendar className="h-4 w-4 mr-2" />
                View Events
              </Button>
              <Button onClick={handleSignOut} variant="outline">
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="events" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="events" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Regular Events
            </TabsTrigger>
            <TabsTrigger value="special-events" className="flex items-center gap-2">
              <Star className="h-4 w-4" />
              Special Events
            </TabsTrigger>
            <TabsTrigger value="community-alerts" className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Community Alerts
            </TabsTrigger>
          </TabsList>

          <TabsContent value="events">
            {showForm ? (
              <EventForm
                event={editingEvent}
                onClose={handleFormClose}
                onSave={handleFormClose}
              />
            ) : (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-3xl font-bold">Manage Events</h2>
                  <Button onClick={handleCreateEvent} size="lg">
                    <Plus className="h-5 w-5 mr-2" />
                    Create New Event
                  </Button>
                </div>
                <EventList onEditEvent={handleEditEvent} />
              </div>
            )}
          </TabsContent>

          <TabsContent value="special-events">
            {showSpecialEventForm ? (
              <SpecialEventForm
                specialEvent={editingSpecialEvent}
                onClose={handleSpecialEventFormClose}
                onSave={handleSpecialEventFormClose}
              />
            ) : (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-3xl font-bold">Manage Special Events</h2>
                  <Button onClick={handleCreateSpecialEvent} size="lg">
                    <Plus className="h-5 w-5 mr-2" />
                    Create Special Event
                  </Button>
                </div>
                <SpecialEventsList onEditSpecialEvent={handleEditSpecialEvent} />
              </div>
            )}
          </TabsContent>

          <TabsContent value="community-alerts">
            {showCommunityAlertForm ? (
              <CommunityAlertForm
                alert={editingCommunityAlert}
                onClose={handleCommunityAlertFormClose}
                onSave={handleCommunityAlertFormClose}
              />
            ) : (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-3xl font-bold">Manage Community Alerts</h2>
                  <Button onClick={handleCreateCommunityAlert} size="lg">
                    <Plus className="h-5 w-5 mr-2" />
                    Create Community Alert
                  </Button>
                </div>
                <CommunityAlertsList onEditAlert={handleEditCommunityAlert} />
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;