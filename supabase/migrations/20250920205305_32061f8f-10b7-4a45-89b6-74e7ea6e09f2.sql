-- Create community_alerts table
CREATE TABLE public.community_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  short_description TEXT NOT NULL,
  long_description TEXT NOT NULL,
  photos TEXT[], -- Array of photo URLs
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.community_alerts ENABLE ROW LEVEL SECURITY;

-- Create policies for community alerts (public read access, admin write access)
CREATE POLICY "Community alerts are publicly viewable" 
ON public.community_alerts 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can create community alerts" 
ON public.community_alerts 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update community alerts" 
ON public.community_alerts 
FOR UPDATE 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete community alerts" 
ON public.community_alerts 
FOR DELETE 
USING (auth.uid() IS NOT NULL);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_community_alerts_updated_at
BEFORE UPDATE ON public.community_alerts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();