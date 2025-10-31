import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { MapPin, Loader2, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface GeocodingStats {
  total: number;
  geocoded: number;
  needsGeocoding: number;
}

interface GeocodingResult {
  success: boolean;
  geocoded: number;
  failed: number;
  skipped?: number;
  failedResources?: Array<{
    id: string;
    name: string;
    address: string;
    reason?: string;
  }>;
  message: string;
}

export function ResourceGeocoding() {
  const { toast } = useToast();
  const [stats, setStats] = useState<GeocodingStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [geocoding, setGeocoding] = useState(false);
  const [result, setResult] = useState<GeocodingResult | null>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      
      // Get total resources with addresses
      const { count: totalCount } = await supabase
        .from('resources')
        .select('id', { count: 'exact', head: true })
        .not('address', 'is', null);

      // Get resources already geocoded
      const { count: geocodedCount } = await supabase
        .from('resources')
        .select('id', { count: 'exact', head: true })
        .not('address', 'is', null)
        .not('latitude', 'is', null);

      setStats({
        total: totalCount || 0,
        geocoded: geocodedCount || 0,
        needsGeocoding: (totalCount || 0) - (geocodedCount || 0),
      });
    } catch (error) {
      console.error('Error fetching geocoding stats:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch geocoding statistics',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGeocode = async () => {
    if (!stats || stats.needsGeocoding === 0) return;

    try {
      setGeocoding(true);
      setResult(null);

      toast({
        title: 'Geocoding Started',
        description: `Processing ${stats.needsGeocoding} resources. This will take approximately ${Math.ceil(stats.needsGeocoding * 1.2 / 60)} minutes...`,
      });

      const { data, error } = await supabase.functions.invoke('geocode-resources');

      if (error) throw error;

      const resultData = data as GeocodingResult;
      setResult(resultData);

      // Refresh stats
      await fetchStats();

      if (resultData.success) {
        toast({
          title: 'Geocoding Complete',
          description: `Successfully geocoded ${resultData.geocoded} resources. ${resultData.failed} failed.`,
        });
      }
    } catch (error: any) {
      console.error('Error geocoding resources:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to geocode resources',
        variant: 'destructive',
      });
    } finally {
      setGeocoding(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Map Geocoding
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Map Geocoding Status
        </CardTitle>
        <CardDescription>
          Convert resource addresses to map coordinates for the interactive map view
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {stats && (
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-muted p-4 rounded-lg">
              <div className="text-2xl font-bold">{stats.total}</div>
              <div className="text-sm text-muted-foreground">Total Resources</div>
            </div>
            <div className="bg-muted p-4 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{stats.geocoded}</div>
              <div className="text-sm text-muted-foreground">Geocoded</div>
            </div>
            <div className="bg-muted p-4 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">{stats.needsGeocoding}</div>
              <div className="text-sm text-muted-foreground">Need Geocoding</div>
            </div>
          </div>
        )}

        {stats && stats.needsGeocoding > 0 && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {stats.needsGeocoding} resources need geocoding. This process takes approximately 1 second per resource due to rate limiting.
            </AlertDescription>
          </Alert>
        )}

        <div className="flex gap-2">
          <Button
            onClick={handleGeocode}
            disabled={geocoding || !stats || stats.needsGeocoding === 0}
            className="flex-1"
          >
            {geocoding ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Geocoding... (~{Math.ceil((stats?.needsGeocoding || 0) * 1.2 / 60)} min)
              </>
            ) : (
              <>
                <MapPin className="h-4 w-4 mr-2" />
                Geocode All Resources
              </>
            )}
          </Button>
          <Button onClick={fetchStats} variant="outline" disabled={geocoding}>
            Refresh Stats
          </Button>
        </div>

        {result && (
          <div className="space-y-4 mt-4">
            <Alert variant={result.success ? 'default' : 'destructive'}>
              {result.success ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <XCircle className="h-4 w-4" />
              )}
              <AlertDescription>
                <div className="font-semibold mb-2">{result.message}</div>
                <div className="text-sm space-y-1">
                  <div>✓ Successfully geocoded: {result.geocoded}</div>
                  <div>✗ Failed to geocode: {result.failed}</div>
                  {result.skipped && result.skipped > 0 && (
                    <div>⊘ Skipped (P.O. Boxes): {result.skipped}</div>
                  )}
                </div>
              </AlertDescription>
            </Alert>

            {result.failedResources && result.failedResources.length > 0 && (
              <div className="border rounded-lg p-4">
                <h4 className="font-semibold mb-2 text-sm">Unable to Geocode ({result.failedResources.length}):</h4>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {result.failedResources.map((resource) => (
                    <div key={resource.id} className="text-sm bg-muted p-2 rounded">
                      <div className="font-medium">{resource.name}</div>
                      <div className="text-muted-foreground text-xs">{resource.address}</div>
                      {resource.reason && (
                        <div className="text-muted-foreground text-xs italic mt-1">
                          Reason: {resource.reason}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {stats && stats.needsGeocoding === 0 && stats.total > 0 && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription className="text-green-600">
              All resources have been geocoded! The map view is ready to use.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
