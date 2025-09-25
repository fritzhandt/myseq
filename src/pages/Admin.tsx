import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { EventForm } from '@/components/EventForm';
import { EventList } from '@/components/EventList';
import SpecialEventForm from '@/components/SpecialEventForm';
import SpecialEventsList from '@/components/SpecialEventsList';
import CommunityAlertForm from '@/components/CommunityAlertForm';
import CommunityAlertsList from '@/components/CommunityAlertsList';
import ResourceForm from '@/components/ResourceForm';
import ResourcesList from '@/components/ResourcesList';
import CivicOrganizationsManager from '@/components/CivicOrganizationsManager';
import JobCSVUpload from '@/components/JobCSVUpload';
import JobReportsList from '@/components/JobReportsList';
// Temporary comment to force rebuild
import AgencyDocumentUpload from '@/components/AgencyDocumentUpload';
import { PendingApprovalsManager } from '@/components/PendingApprovalsManager';
import { useToast } from '@/hooks/use-toast';
import { useUserRole } from '@/hooks/useUserRole';
import { Plus, Calendar, LogOut, Star, AlertTriangle, Users, MapPin, FileText, Building2, Clock } from 'lucide-react';

// Admin Panel - Role-based access control system
const Admin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { userRole, loading: roleLoading, isMainAdmin, hasAdminAccess } = useUserRole();
  const [loading, setLoading] = useState(true);
  const [pendingCount, setPendingCount] = useState(0);
  
  // Form visibility states
  const [showEventForm, setShowEventForm] = useState(false);
  const [showSpecialEventForm, setShowSpecialEventForm] = useState(false);
  const [showCommunityAlertForm, setShowCommunityAlertForm] = useState(false);
  const [showResourceForm, setShowResourceForm] = useState(false);
  
  // Editing states
  const [editingEvent, setEditingEvent] = useState<any>(null);
  const [editingSpecialEvent, setEditingSpecialEvent] = useState<any>(null);
  const [editingCommunityAlert, setEditingCommunityAlert] = useState<any>(null);
  const [editingResource, setEditingResource] = useState<any>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          navigate('/auth');
          return;
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error checking auth:', error);
        navigate('/auth');
      }
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_OUT' || !session) {
          navigate('/auth');
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [navigate]);

  // Fetch pending approvals count for main admin
  useEffect(() => {
    const fetchPendingCount = async () => {
      if (!isMainAdmin) return;
      
      try {
        const [events, resources, alerts, specialEvents] = await Promise.all([
          supabase.from('pending_events').select('id', { count: 'exact' }).eq('status', 'pending'),
          supabase.from('pending_resources').select('id', { count: 'exact' }).eq('status', 'pending'),
          supabase.from('pending_community_alerts').select('id', { count: 'exact' }).eq('status', 'pending'),
          supabase.from('pending_special_events').select('id', { count: 'exact' }).eq('status', 'pending')
        ]);
        
        const total = (events.count || 0) + (resources.count || 0) + (alerts.count || 0) + (specialEvents.count || 0);
        setPendingCount(total);
      } catch (error) {
        console.error('Error fetching pending count:', error);
      }
    };

    fetchPendingCount();
    
    // Refresh count every 30 seconds
    const interval = setInterval(fetchPendingCount, 30000);
    return () => clearInterval(interval);
  }, [isMainAdmin]);

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

  // Event handlers
  const handleCreateEvent = () => {
    setEditingEvent(null);
    setShowEventForm(true);
  };

  const handleEditEvent = (event: any) => {
    setEditingEvent(event);
    setShowEventForm(true);
  };

  const handleEventFormClose = () => {
    setShowEventForm(false);
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

  const handleCreateResource = () => {
    setEditingResource(null);
    setShowResourceForm(true);
  };

  const handleEditResource = (resource: any) => {
    setEditingResource(resource);
    setShowResourceForm(true);
  };

  const handleResourceFormClose = () => {
    setShowResourceForm(false);
    setEditingResource(null);
  };

  if (loading || roleLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!hasAdminAccess) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-muted-foreground mb-4">You don't have admin access to this page.</p>
          <Button onClick={() => navigate('/')}>Go Home</Button>
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
              <div>
                <h1 className="text-2xl font-bold">Admin Panel</h1>
                <p className="text-sm text-muted-foreground">
                  Role: {userRole === 'main_admin' ? 'Main Admin' : 'Sub Admin'}
                </p>
              </div>
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
        <Tabs defaultValue={isMainAdmin ? "pending-approvals" : "events"} className="w-full">
          <TabsList className={`grid w-full ${isMainAdmin ? 'grid-cols-8' : 'grid-cols-7'} mb-8`}>
            {isMainAdmin && (
              <TabsTrigger value="pending-approvals" className="flex items-center gap-2 relative">
                <Clock className="h-4 w-4" />
                Pending
                {pendingCount > 0 && (
                  <Badge variant="destructive" className="ml-1 h-5 w-5 p-0 text-xs">
                    {pendingCount}
                  </Badge>
                )}
              </TabsTrigger>
            )}
            <TabsTrigger value="events" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Events
            </TabsTrigger>
            <TabsTrigger value="special-events" className="flex items-center gap-2">
              <Star className="h-4 w-4" />
              Special
            </TabsTrigger>
            <TabsTrigger value="community-alerts" className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Alerts
            </TabsTrigger>
            <TabsTrigger value="resources" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Resources
            </TabsTrigger>
            <TabsTrigger value="civics" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Civic Orgs
            </TabsTrigger>
            <TabsTrigger value="jobs" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Jobs
            </TabsTrigger>
            <TabsTrigger value="agencies" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Docs
            </TabsTrigger>
          </TabsList>

          {isMainAdmin && (
            <TabsContent value="pending-approvals" className="space-y-4">
              <PendingApprovalsManager />
            </TabsContent>
          )}

          <TabsContent value="events">
            {showEventForm ? (
              <EventForm
                event={editingEvent}
                onClose={handleEventFormClose}
                onSave={handleEventFormClose}
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

          <TabsContent value="resources">
            {showResourceForm ? (
              <ResourceForm
                resource={editingResource}
                onClose={handleResourceFormClose}
                onSave={handleResourceFormClose}
              />
            ) : (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-3xl font-bold">Manage Community Resources</h2>
                  <Button onClick={handleCreateResource} size="lg">
                    <Plus className="h-5 w-5 mr-2" />
                    Create New Resource
                  </Button>
                </div>
                <ResourcesList onEdit={handleEditResource} />
              </div>
            )}
          </TabsContent>

          <TabsContent value="civics">
            <CivicOrganizationsManager />
          </TabsContent>

          <TabsContent value="jobs">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold">Manage Jobs</h2>
              </div>
              <JobCSVUpload />
              <JobReportsList />
            </div>
          </TabsContent>

          <TabsContent value="agencies">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold">Government Agency Documents</h2>
              </div>
              <p className="text-muted-foreground">
                Upload PDF or Word documents containing government agency information to improve the "Solve My Issue" search functionality.
              </p>
              <AgencyDocumentUpload />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;