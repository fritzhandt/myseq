-- Create table for government agencies
CREATE TABLE public.government_agencies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  website TEXT NOT NULL,
  level TEXT NOT NULL CHECK (level IN ('city', 'state', 'federal')),
  keywords TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.government_agencies ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Government agencies are publicly viewable" 
ON public.government_agencies 
FOR SELECT 
USING (true);

-- Create policies for authenticated admin access
CREATE POLICY "Authenticated users can create government agencies" 
ON public.government_agencies 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update government agencies" 
ON public.government_agencies 
FOR UPDATE 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete government agencies" 
ON public.government_agencies 
FOR DELETE 
USING (auth.uid() IS NOT NULL);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_government_agencies_updated_at
BEFORE UPDATE ON public.government_agencies
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for text search
CREATE INDEX idx_government_agencies_search ON public.government_agencies USING GIN (
  to_tsvector('english', name || ' ' || description)
);

-- Create index for level filtering
CREATE INDEX idx_government_agencies_level ON public.government_agencies (level);