import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { Wand2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export const AltTextGenerator = () => {
  const { toast } = useToast();
  const [generating, setGenerating] = useState(false);
  const [shouldStop, setShouldStop] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stats, setStats] = useState<{
    total: number;
    processed: number;
    success: number;
    failed: number;
  } | null>(null);

  const generateAltTexts = async () => {
    setGenerating(true);
    setShouldStop(false);
    setProgress(0);
    let successCount = 0;
    let failedCount = 0;
    let processedCount = 0;

    try {
      // Fetch all images without alt text
      const imagesToProcess: Array<{
        table: string;
        id: string;
        imageUrl: string;
        imageField: string;
        altField: string;
      }> = [];

      // Events - cover photos
      const { data: eventsWithCover } = await supabase
        .from('events')
        .select('id, cover_photo_url')
        .not('cover_photo_url', 'is', null)
        .is('cover_photo_alt', null);
      
      eventsWithCover?.forEach(event => {
        imagesToProcess.push({
          table: 'events',
          id: event.id,
          imageUrl: event.cover_photo_url,
          imageField: 'cover_photo_url',
          altField: 'cover_photo_alt'
        });
      });

      // Resources - logos
      const { data: resourcesWithLogo } = await supabase
        .from('resources')
        .select('id, logo_url')
        .not('logo_url', 'is', null)
        .is('logo_alt', null);
      
      resourcesWithLogo?.forEach(resource => {
        imagesToProcess.push({
          table: 'resources',
          id: resource.id,
          imageUrl: resource.logo_url,
          imageField: 'logo_url',
          altField: 'logo_alt'
        });
      });

      // Resources - cover photos
      const { data: resourcesWithCover } = await supabase
        .from('resources')
        .select('id, cover_photo_url')
        .not('cover_photo_url', 'is', null)
        .is('cover_photo_alt', null);
      
      resourcesWithCover?.forEach(resource => {
        imagesToProcess.push({
          table: 'resources',
          id: resource.id,
          imageUrl: resource.cover_photo_url,
          imageField: 'cover_photo_url',
          altField: 'cover_photo_alt'
        });
      });

      // Civic Gallery
      const { data: galleryItems } = await supabase
        .from('civic_gallery')
        .select('id, photo_url')
        .not('photo_url', 'is', null)
        .is('alt_text', null);
      
      galleryItems?.forEach(item => {
        imagesToProcess.push({
          table: 'civic_gallery',
          id: item.id,
          imageUrl: item.photo_url,
          imageField: 'photo_url',
          altField: 'alt_text'
        });
      });

      // Civic Leadership
      const { data: leadershipItems } = await supabase
        .from('civic_leadership')
        .select('id, photo_url')
        .not('photo_url', 'is', null)
        .is('photo_alt', null);
      
      leadershipItems?.forEach(item => {
        imagesToProcess.push({
          table: 'civic_leadership',
          id: item.id,
          imageUrl: item.photo_url,
          imageField: 'photo_url',
          altField: 'photo_alt'
        });
      });

      const totalImages = imagesToProcess.length;
      setStats({
        total: totalImages,
        processed: 0,
        success: 0,
        failed: 0
      });

      if (totalImages === 0) {
        toast({
          title: "No images need alt text",
          description: "All images already have alt text!",
        });
        setGenerating(false);
        return;
      }

      toast({
        title: "Generating alt text",
        description: `Processing ${totalImages} images...`,
      });

      // Process images in batches to avoid rate limits
      const batchSize = 3;
      for (let i = 0; i < imagesToProcess.length; i += batchSize) {
        if (shouldStop) {
          toast({
            title: "Generation stopped",
            description: `Stopped after processing ${processedCount} of ${totalImages} images.`,
          });
          break;
        }
        
        const batch = imagesToProcess.slice(i, Math.min(i + batchSize, imagesToProcess.length));
        
        await Promise.all(batch.map(async (item) => {
          try {
            const { data, error } = await supabase.functions.invoke('generate-alt-text', {
              body: { imageUrl: item.imageUrl }
            });

            if (error) throw error;

            const altText = data.results?.[0]?.altText;
            
            if (altText) {
              const updateData: any = {};
              updateData[item.altField] = altText;

              const { error: updateError } = await supabase
                .from(item.table)
                .update(updateData)
                .eq('id', item.id);

              if (updateError) throw updateError;
              
              successCount++;
            } else {
              throw new Error('No alt text generated');
            }
          } catch (error) {
            console.error(`Failed to generate alt text for ${item.table}/${item.id}:`, error);
            failedCount++;
          }

          processedCount++;
          setProgress((processedCount / totalImages) * 100);
          setStats({
            total: totalImages,
            processed: processedCount,
            success: successCount,
            failed: failedCount
          });
        }));

        // Add delay between batches to avoid rate limiting
        if (i + batchSize < imagesToProcess.length) {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }

      toast({
        title: "Alt text generation complete",
        description: `Successfully generated ${successCount} alt texts. ${failedCount} failed.`,
        variant: failedCount > 0 ? "destructive" : "default"
      });

    } catch (error) {
      console.error('Error generating alt texts:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate alt texts",
        variant: "destructive"
      });
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wand2 className="h-5 w-5" />
          Alt Text Generator
        </CardTitle>
        <CardDescription>
          Generate WCAG-compliant alt text for all images missing descriptions using AI
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            This will scan all events, resources, civic gallery, and leadership photos that are missing alt text and generate descriptive alt text using AI vision models.
          </AlertDescription>
        </Alert>

        {stats && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress: {stats.processed} / {stats.total}</span>
              <span className="text-muted-foreground">
                ✓ {stats.success} · ✗ {stats.failed}
              </span>
            </div>
            <Progress value={progress} />
          </div>
        )}

        <div className="flex gap-2">
          <Button 
            onClick={generateAltTexts} 
            disabled={generating}
            size="lg"
            className="flex-1"
          >
            <Wand2 className="h-4 w-4 mr-2" />
            {generating ? 'Generating Alt Text...' : 'Generate Missing Alt Tags'}
          </Button>
          
          {generating && (
            <Button 
              onClick={() => setShouldStop(true)} 
              variant="destructive"
              size="lg"
            >
              Stop
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
