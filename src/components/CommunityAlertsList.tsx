import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Edit, Trash2, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';

interface CommunityAlert {
  id: string;
  title: string;
  short_description: string;
  long_description: string;
  photos: string[] | null;
  is_active: boolean;
  created_at: string;
}

interface CommunityAlertsListProps {
  onEditAlert: (alert: CommunityAlert) => void;
}

const CommunityAlertsList = ({ onEditAlert }: CommunityAlertsListProps) => {
  const [alerts, setAlerts] = useState<CommunityAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchAlerts = async () => {
    const { data, error } = await supabase
      .from('community_alerts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setAlerts(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAlerts();

    // Subscribe to changes
    const subscription = supabase
      .channel('community_alerts_list')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'community_alerts' }, 
        () => {
          fetchAlerts();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this community alert?')) {
      return;
    }

    const { error } = await supabase
      .from('community_alerts')
      .delete()
      .eq('id', id);

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Community alert deleted successfully!",
      });
    }
  };

  const toggleActive = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from('community_alerts')
      .update({ is_active: !currentStatus })
      .eq('id', id);

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: `Alert ${!currentStatus ? 'activated' : 'deactivated'} successfully!`,
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (alerts.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <p className="text-muted-foreground">No community alerts found.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {alerts.map((alert) => (
        <Card key={alert.id}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <CardTitle className="text-lg">{alert.title}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Created: {new Date(alert.created_at).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={alert.is_active ? "default" : "secondary"}>
                  {alert.is_active ? "Active" : "Inactive"}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              {alert.short_description}
            </p>
            
            {alert.photos && alert.photos.length > 0 && (
              <div className="flex gap-2 mb-4">
                {alert.photos.slice(0, 3).map((photo, index) => (
                  <img
                    key={index}
                    src={photo}
                    alt={`${alert.title} ${index + 1}`}
                    className="w-16 h-16 object-cover rounded"
                  />
                ))}
                {alert.photos.length > 3 && (
                  <div className="w-16 h-16 bg-muted rounded flex items-center justify-center text-sm">
                    +{alert.photos.length - 3}
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEditAlert(alert)}
              >
                <Edit className="h-4 w-4 mr-1" />
                Edit
              </Button>
              
              {alert.is_active && (
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                >
                  <Link to={`/community-alert/${alert.id}`}>
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Link>
                </Button>
              )}
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => toggleActive(alert.id, alert.is_active)}
              >
                {alert.is_active ? 'Deactivate' : 'Activate'}
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDelete(alert.id)}
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Delete
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default CommunityAlertsList;