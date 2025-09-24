-- Add important_links table for civic organizations
CREATE TABLE public.civic_important_links (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  civic_org_id uuid NOT NULL,
  title text NOT NULL,
  url text NOT NULL,
  description text,
  order_index integer DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Add gallery table for civic organizations  
CREATE TABLE public.civic_gallery (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  civic_org_id uuid NOT NULL,
  title text,
  description text,
  photo_url text NOT NULL,
  order_index integer DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS for both tables
ALTER TABLE public.civic_important_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.civic_gallery ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for civic_important_links
CREATE POLICY "Important links are publicly viewable" 
ON public.civic_important_links 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Authenticated users can create important links" 
ON public.civic_important_links 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update important links" 
ON public.civic_important_links 
FOR UPDATE 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete important links" 
ON public.civic_important_links 
FOR DELETE 
USING (auth.uid() IS NOT NULL);

-- Create RLS policies for civic_gallery
CREATE POLICY "Gallery photos are publicly viewable" 
ON public.civic_gallery 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can create gallery photos" 
ON public.civic_gallery 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update gallery photos" 
ON public.civic_gallery 
FOR UPDATE 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete gallery photos" 
ON public.civic_gallery 
FOR DELETE 
USING (auth.uid() IS NOT NULL);

-- Add triggers for updated_at columns
CREATE TRIGGER update_civic_important_links_updated_at
BEFORE UPDATE ON public.civic_important_links
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_civic_gallery_updated_at
BEFORE UPDATE ON public.civic_gallery
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();