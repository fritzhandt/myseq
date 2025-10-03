import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, Clock, Building2, AlertTriangle, FileText, Star } from 'lucide-react';
import { format } from 'date-fns';

interface PendingItem {
  id: string;
  title: string;
  type: 'event' | 'special_event' | 'community_alert' | 'resource' | 'resource_modification' | 'job_modification' | 'civic_modification';
  status: string;
  submitted_at: string;
  reviewed_at?: string;
  review_notes?: string;
  action?: 'edit' | 'delete' | 'deactivate' | 'password_change';
  data: any;
}

const MyPendingSubmissions = () => {
  const [pendingItems, setPendingItems] = useState<PendingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchMyPendingItems = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [
        eventsRes, 
        specialEventsRes, 
        alertsRes, 
        resourcesRes, 
        resourceModsRes,
        jobModsRes,
        civicModsRes
      ] = await Promise.all([
        supabase
          .from('pending_events')
          .select('*')
          .eq('submitted_by', user.id)
          .order('submitted_at', { ascending: false }),
        
        supabase
          .from('pending_special_events')
          .select('*')
          .eq('submitted_by', user.id)
          .order('submitted_at', { ascending: false }),
        
        supabase
          .from('pending_community_alerts')
          .select('*')
          .eq('submitted_by', user.id)
          .order('submitted_at', { ascending: false }),
        
        supabase
          .from('pending_resources')
          .select('*')
          .eq('submitted_by', user.id)
          .order('submitted_at', { ascending: false }),
        
        supabase
          .from('pending_resource_modifications')
          .select('*, resources(organization_name)')
          .eq('submitted_by', user.id)
          .order('submitted_at', { ascending: false }),
        
        supabase
          .from('pending_job_modifications')
          .select('*, jobs(title)')
          .eq('submitted_by', user.id)
          .order('submitted_at', { ascending: false }),
        
        supabase
          .from('pending_civic_modifications')
          .select('*, civic_organizations(name)')
          .eq('submitted_by', user.id)
          .order('submitted_at', { ascending: false })
      ]);

      const items: PendingItem[] = [];

      // Process events
      if (eventsRes.data) {
        eventsRes.data.forEach(item => {
          items.push({
            id: item.id,
            title: item.title,
            type: 'event',
            status: item.status,
            submitted_at: item.submitted_at,
            reviewed_at: item.reviewed_at,
            review_notes: item.review_notes,
            data: item
          });
        });
      }

      // Process special events
      if (specialEventsRes.data) {
        specialEventsRes.data.forEach(item => {
          items.push({
            id: item.id,
            title: item.title,
            type: 'special_event',
            status: item.status,
            submitted_at: item.submitted_at,
            reviewed_at: item.reviewed_at,
            review_notes: item.review_notes,
            data: item
          });
        });
      }

      // Process alerts
      if (alertsRes.data) {
        alertsRes.data.forEach(item => {
          items.push({
            id: item.id,
            title: item.title,
            type: 'community_alert',
            status: item.status,
            submitted_at: item.submitted_at,
            reviewed_at: item.reviewed_at,
            review_notes: item.review_notes,
            data: item
          });
        });
      }

      // Process resources
      if (resourcesRes.data) {
        resourcesRes.data.forEach(item => {
          items.push({
            id: item.id,
            title: item.organization_name,
            type: 'resource',
            status: item.status,
            submitted_at: item.submitted_at,
            reviewed_at: item.reviewed_at,
            review_notes: item.review_notes,
            data: item
          });
        });
      }

      // Process resource modifications
      if (resourceModsRes.data) {
        resourceModsRes.data.forEach(item => {
          items.push({
            id: item.id,
            title: `${item.action.toUpperCase()}: ${item.resources?.organization_name || 'Resource'}`,
            type: 'resource_modification',
            action: item.action,
            status: item.status,
            submitted_at: item.submitted_at,
            reviewed_at: item.reviewed_at,
            review_notes: item.review_notes,
            data: item
          });
        });
      }

      // Process job modifications
      if (jobModsRes.data) {
        jobModsRes.data.forEach(item => {
          items.push({
            id: item.id,
            title: `${item.action.toUpperCase()}: ${item.jobs?.title || 'Job'}`,
            type: 'job_modification',
            action: item.action,
            status: item.status,
            submitted_at: item.submitted_at,
            reviewed_at: item.reviewed_at,
            review_notes: item.review_notes,
            data: item
          });
        });
      }

      // Process civic modifications
      if (civicModsRes.data) {
        civicModsRes.data.forEach(item => {
          items.push({
            id: item.id,
            title: `${item.action.toUpperCase()}: ${item.civic_organizations?.name || 'Civic Org'}`,
            type: 'civic_modification',
            action: item.action,
            status: item.status,
            submitted_at: item.submitted_at,
            reviewed_at: item.reviewed_at,
            review_notes: item.review_notes,
            data: item
          });
        });
      }

      // Sort all items by submission date
      items.sort((a, b) => new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime());
      
      setPendingItems(items);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch pending submissions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyPendingItems();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'event':
        return <Calendar className="h-4 w-4" />;
      case 'special_event':
        return <Star className="h-4 w-4" />;
      case 'community_alert':
        return <AlertTriangle className="h-4 w-4" />;
      case 'resource':
        return <Building2 className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'event':
        return 'Event';
      case 'special_event':
        return 'Special Event';
      case 'community_alert':
        return 'Community Alert';
      case 'resource':
        return 'Resource';
      case 'resource_modification':
        return 'Resource Modification';
      case 'job_modification':
        return 'Job Modification';
      case 'civic_modification':
        return 'Civic Modification';
      default:
        return 'Item';
    }
  };

  const renderItemDetails = (item: PendingItem) => {
    switch (item.type) {
      case 'event':
        return (
          <div className="space-y-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>{format(new Date(item.data.event_date), 'EEE, MMM d, yyyy')}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>{item.data.event_time}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <span>{item.data.location}</span>
            </div>
          </div>
        );
      case 'special_event':
        return (
          <div className="space-y-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>{format(new Date(item.data.start_date), 'MMM d, yyyy')}</span>
              {item.data.end_date && (
                <span>- {format(new Date(item.data.end_date), 'MMM d, yyyy')}</span>
              )}
            </div>
            <div>Type: {item.data.type.replace('_', ' ')}</div>
          </div>
        );
      case 'community_alert':
        return (
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>{item.data.short_description}</p>
          </div>
        );
      case 'resource':
        return (
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>{item.data.description}</p>
            {item.data.categories && item.data.categories.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {item.data.categories.map((category: string, index: number) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {category}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p>Loading your submissions...</p>
        </div>
      </div>
    );
  }

  if (pendingItems.length === 0) {
    return (
      <div className="text-center p-8">
        <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">No Submissions Yet</h3>
        <p className="text-muted-foreground">
          Your submitted events, alerts, resources, and special events will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">My Pending Submissions</h2>
        <Button onClick={fetchMyPendingItems} variant="outline" size="sm">
          Refresh
        </Button>
      </div>
      
      <div className="grid gap-4">
        {pendingItems.map((item) => (
          <Card key={`${item.type}-${item.id}`}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  {getTypeIcon(item.type)}
                  <CardTitle className="text-lg">{item.title}</CardTitle>
                </div>
                <Badge className={getStatusColor(item.status)}>
                  {item.status.toUpperCase()}
                </Badge>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>{getTypeLabel(item.type)}</span>
                <span>•</span>
                <span>Submitted {format(new Date(item.submitted_at), 'MMM d, yyyy')}</span>
                {item.reviewed_at && (
                  <>
                    <span>•</span>
                    <span>Reviewed {format(new Date(item.reviewed_at), 'MMM d, yyyy')}</span>
                  </>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {renderItemDetails(item)}
              {item.review_notes && (
                <div className="mt-4 p-3 bg-muted rounded-lg">
                  <h4 className="text-sm font-semibold mb-1">Review Notes:</h4>
                  <p className="text-sm text-muted-foreground">{item.review_notes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default MyPendingSubmissions;