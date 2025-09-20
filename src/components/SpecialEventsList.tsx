import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Pencil, Trash2, Calendar, Eye, EyeOff } from 'lucide-react';
import { format } from 'date-fns';

interface SpecialEvent {
  id: string;
  title: string;
  description?: string;
  type: 'single_day' | 'multi_day';
  start_date: string;
  end_date?: string;
  is_active: boolean;
  created_at: string;
}

interface SpecialEventsListProps {
  onEditSpecialEvent: (specialEvent: SpecialEvent) => void;
}

const SpecialEventsList = ({ onEditSpecialEvent }: SpecialEventsListProps) => {
  const [specialEvents, setSpecialEvents] = useState<SpecialEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchSpecialEvents();
  }, []);

  const fetchSpecialEvents = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('special_events')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSpecialEvents((data || []).map(event => ({
        ...event,
        type: event.type as 'single_day' | 'multi_day'
      })));
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch special events",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (specialEvent: SpecialEvent) => {
    try {
      const { error } = await supabase
        .from('special_events')
        .update({ is_active: !specialEvent.is_active })
        .eq('id', specialEvent.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Special event ${!specialEvent.is_active ? 'activated' : 'deactivated'}!`,
      });

      fetchSpecialEvents();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (specialEvent: SpecialEvent) => {
    if (!confirm(`Are you sure you want to delete "${specialEvent.title}"?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('special_events')
        .delete()
        .eq('id', specialEvent.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Special event deleted successfully!",
      });

      fetchSpecialEvents();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
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

  return (
    <div className="space-y-4">
      {specialEvents.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No special events yet</h3>
              <p className="text-muted-foreground">
                Create your first special event to get started.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        specialEvents.map((specialEvent) => (
          <Card key={specialEvent.id} className={specialEvent.is_active ? 'ring-2 ring-primary' : ''}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CardTitle>{specialEvent.title}</CardTitle>
                    {specialEvent.is_active && (
                      <Badge variant="default">Active</Badge>
                    )}
                    <Badge variant="outline">
                      {specialEvent.type === 'single_day' ? 'Single Day' : 'Multi Day'}
                    </Badge>
                  </div>
                  {specialEvent.description && (
                    <p className="text-muted-foreground">{specialEvent.description}</p>
                  )}
                  <div className="text-sm text-muted-foreground">
                    {specialEvent.type === 'single_day' 
                      ? format(new Date(specialEvent.start_date), 'MMMM d, yyyy')
                      : `${format(new Date(specialEvent.start_date), 'MMM d')} - ${format(new Date(specialEvent.end_date!), 'MMM d, yyyy')}`
                    }
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleToggleActive(specialEvent)}
                    variant="outline"
                    size="sm"
                    title={specialEvent.is_active ? 'Deactivate' : 'Activate'}
                  >
                    {specialEvent.is_active ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    onClick={() => onEditSpecialEvent(specialEvent)}
                    variant="outline"
                    size="sm"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    onClick={() => handleDelete(specialEvent)}
                    variant="outline"
                    size="sm"
                    disabled={specialEvent.is_active}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
          </Card>
        ))
      )}
    </div>
  );
};

export default SpecialEventsList;