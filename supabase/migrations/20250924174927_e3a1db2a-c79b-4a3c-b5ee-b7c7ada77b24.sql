-- Add civic organization support to events table
ALTER TABLE public.events 
ADD COLUMN civic_org_id uuid REFERENCES public.civic_organizations(id),
ADD COLUMN is_public boolean NOT NULL DEFAULT false;

-- Create index for civic events queries
CREATE INDEX idx_events_civic_org_id ON public.events(civic_org_id);
CREATE INDEX idx_events_public ON public.events(is_public);

-- Update RLS policies to support civic events
DROP POLICY IF EXISTS "Active events are viewable by everyone" ON public.events;
DROP POLICY IF EXISTS "Authenticated users can view archived events" ON public.events;

-- Create new RLS policies for civic events
CREATE POLICY "Public events are viewable by everyone" 
ON public.events 
FOR SELECT 
USING (archived = false AND (is_public = true OR civic_org_id IS NULL));

CREATE POLICY "Civic events are viewable by everyone when not archived" 
ON public.events 
FOR SELECT 
USING (archived = false AND civic_org_id IS NOT NULL);

CREATE POLICY "Authenticated users can view all events including archived" 
ON public.events 
FOR SELECT 
USING (auth.uid() IS NOT NULL);