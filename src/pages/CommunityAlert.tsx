import { useState, useEffect } from 'react';
import { useParams, Navigate, useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { 
  Carousel, 
  CarouselContent, 
  CarouselItem, 
  CarouselNext, 
  CarouselPrevious 
} from '@/components/ui/carousel';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';

interface CommunityAlert {
  id: string;
  title: string;
  short_description: string;
  long_description: string;
  photos: string[] | null;
  is_active: boolean;
}

const CommunityAlert = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [alert, setAlert] = useState<CommunityAlert | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAlert = async () => {
      if (!id) return;

      const { data, error } = await supabase
        .from('community_alerts')
        .select('*')
        .eq('id', id)
        .eq('is_active', true)
        .maybeSingle();

      if (data && !error) {
        setAlert(data);
      }
      setLoading(false);
    };

    fetchAlert();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
          <p className="text-muted-foreground">Loading alert...</p>
        </div>
      </div>
    );
  }

  if (!alert) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Button>

        {/* Title */}
        <h1 className="text-3xl md:text-4xl font-bold mb-6">
          {alert.title}
        </h1>

        {/* Photo Carousel */}
        {alert.photos && alert.photos.length > 0 && (
          <div className="mb-8">
            {alert.photos.length === 1 ? (
              <div className="w-full md:w-4/5 lg:w-4/5">
                <img
                  src={alert.photos[0]}
                  alt={alert.title}
                  className="w-full h-auto rounded-lg shadow-lg"
                />
              </div>
            ) : (
              <Carousel className="w-full md:w-4/5 lg:w-4/5">
                <CarouselContent>
                  {alert.photos.map((photo, index) => (
                    <CarouselItem key={index}>
                      <Card>
                        <CardContent className="flex aspect-video items-center justify-center p-0">
                          <img
                            src={photo}
                            alt={`${alert.title} - Image ${index + 1}`}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        </CardContent>
                      </Card>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious />
                <CarouselNext />
              </Carousel>
            )}
          </div>
        )}

        {/* Short Description */}
        <div className="mb-6">
          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
            {alert.short_description}
          </p>
        </div>

        {/* Long Description */}
        <div className="prose prose-lg max-w-none mb-8">
          <div className="whitespace-pre-wrap text-foreground leading-relaxed">
            {alert.long_description}
          </div>
        </div>

        {/* Contact Information */}
        <div className="border-t pt-8">
          <div className="bg-muted/30 p-6 rounded-lg">
            <p className="text-center text-muted-foreground">
              For information and updates, <Link to="/contact-elected" className="text-primary hover:underline font-medium">contact your local elected official</Link>. 
              If you are unsure of who your local elected is, <Link to="/my-elected-lookup" className="text-primary hover:underline font-medium">you can find out here</Link>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunityAlert;