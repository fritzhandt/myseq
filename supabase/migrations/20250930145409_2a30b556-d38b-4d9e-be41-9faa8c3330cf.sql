-- Create analytics events table for anonymous usage tracking
CREATE TABLE public.analytics_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL, -- 'page_view', 'tab_view', 'content_click', 'language_change'
  page_path text, -- e.g., '/home', '/civics/org-id'
  civic_org_id uuid REFERENCES civic_organizations(id),
  tab_name text, -- for civic tabs
  content_type text, -- 'link', 'photo', 'announcement', 'newsletter'
  content_id uuid, -- ID of the specific content
  language text, -- language code if applicable
  created_at timestamp with time zone DEFAULT now()
);

-- Indexes for better query performance
CREATE INDEX idx_analytics_events_created_at ON public.analytics_events(created_at);
CREATE INDEX idx_analytics_events_civic_org_id ON public.analytics_events(civic_org_id);
CREATE INDEX idx_analytics_events_event_type ON public.analytics_events(event_type);
CREATE INDEX idx_analytics_events_page_path ON public.analytics_events(page_path);

-- Enable RLS
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert analytics events (anonymous tracking)
CREATE POLICY "Anyone can insert analytics events"
ON public.analytics_events
FOR INSERT
WITH CHECK (true);

-- Main admins can view all analytics
CREATE POLICY "Main admins can view all analytics"
ON public.analytics_events
FOR SELECT
USING (is_main_admin(auth.uid()));

-- Authenticated users can view analytics for their civic org
CREATE POLICY "Civic admins can view their org analytics"
ON public.analytics_events
FOR SELECT
USING (auth.uid() IS NOT NULL AND civic_org_id IS NOT NULL);