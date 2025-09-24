-- Create civic organizations table
CREATE TABLE public.civic_organizations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  coverage_area TEXT NOT NULL,
  contact_info JSONB NOT NULL DEFAULT '{}',
  meeting_info TEXT,
  meeting_address TEXT,
  access_code TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create civic announcements table
CREATE TABLE public.civic_announcements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  civic_org_id UUID NOT NULL REFERENCES public.civic_organizations(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create civic leadership table
CREATE TABLE public.civic_leadership (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  civic_org_id UUID NOT NULL REFERENCES public.civic_organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  title TEXT NOT NULL,
  contact_info JSONB DEFAULT '{}',
  photo_url TEXT,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create civic newsletters table
CREATE TABLE public.civic_newsletters (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  civic_org_id UUID NOT NULL REFERENCES public.civic_organizations(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  file_path TEXT NOT NULL,
  upload_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.civic_organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.civic_announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.civic_leadership ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.civic_newsletters ENABLE ROW LEVEL SECURITY;

-- RLS Policies for civic_organizations
CREATE POLICY "Civic organizations are publicly viewable" 
ON public.civic_organizations 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Authenticated users can create civic organizations" 
ON public.civic_organizations 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update civic organizations" 
ON public.civic_organizations 
FOR UPDATE 
USING (auth.uid() IS NOT NULL);

-- RLS Policies for civic_announcements
CREATE POLICY "Civic announcements are publicly viewable" 
ON public.civic_announcements 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can create civic announcements" 
ON public.civic_announcements 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update civic announcements" 
ON public.civic_announcements 
FOR UPDATE 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete civic announcements" 
ON public.civic_announcements 
FOR DELETE 
USING (auth.uid() IS NOT NULL);

-- RLS Policies for civic_leadership
CREATE POLICY "Civic leadership is publicly viewable" 
ON public.civic_leadership 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can create civic leadership" 
ON public.civic_leadership 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update civic leadership" 
ON public.civic_leadership 
FOR UPDATE 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete civic leadership" 
ON public.civic_leadership 
FOR DELETE 
USING (auth.uid() IS NOT NULL);

-- RLS Policies for civic_newsletters
CREATE POLICY "Civic newsletters are publicly viewable" 
ON public.civic_newsletters 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can create civic newsletters" 
ON public.civic_newsletters 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update civic newsletters" 
ON public.civic_newsletters 
FOR UPDATE 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete civic newsletters" 
ON public.civic_newsletters 
FOR DELETE 
USING (auth.uid() IS NOT NULL);

-- Create indexes for better performance
CREATE INDEX idx_civic_announcements_org_id_created_at ON public.civic_announcements(civic_org_id, created_at DESC);
CREATE INDEX idx_civic_leadership_org_id_order ON public.civic_leadership(civic_org_id, order_index);
CREATE INDEX idx_civic_newsletters_org_id_upload_date ON public.civic_newsletters(civic_org_id, upload_date DESC);

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_civic_organizations_updated_at
BEFORE UPDATE ON public.civic_organizations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_civic_announcements_updated_at
BEFORE UPDATE ON public.civic_announcements
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_civic_leadership_updated_at
BEFORE UPDATE ON public.civic_leadership
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_civic_newsletters_updated_at
BEFORE UPDATE ON public.civic_newsletters
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for civic files
INSERT INTO storage.buckets (id, name, public) VALUES ('civic-files', 'civic-files', true);

-- Create storage policies for civic files
CREATE POLICY "Civic files are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'civic-files');

CREATE POLICY "Authenticated users can upload civic files" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'civic-files' AND auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update civic files" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'civic-files' AND auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete civic files" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'civic-files' AND auth.uid() IS NOT NULL);