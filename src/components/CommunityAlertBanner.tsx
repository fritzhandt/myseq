import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

interface CommunityAlert {
  id: string;
  title: string;
  short_description: string;
  long_description: string;
  photos: string[] | null;
  is_active: boolean;
}

const CommunityAlertBanner = () => {
  const [alert, setAlert] = useState<CommunityAlert | null>(null);

  useEffect(() => {
    const fetchActiveAlert = async () => {
      const { data, error } = await supabase
        .from('community_alerts')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (data && !error) {
        setAlert(data);
      }
    };

    fetchActiveAlert();

    // Subscribe to changes
    const subscription = supabase
      .channel('community_alerts_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'community_alerts' }, 
        () => {
          fetchActiveAlert();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  if (!alert) return null;

  return (
    <Link to={`/community-alert/${alert.id}`} className="block animate-pulse">
      <Alert className="rounded-none border-0 border-b bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors cursor-pointer">
        <AlertDescription className="w-full text-center">
          <div className="font-bold mb-2">
            COMMUNITY ALERT: {alert.short_description}
          </div>
          <div className="font-normal underline">
            Click here for more information
          </div>
        </AlertDescription>
      </Alert>
    </Link>
  );
};

export default CommunityAlertBanner;