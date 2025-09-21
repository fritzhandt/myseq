-- Add archived column to events table
ALTER TABLE public.events 
ADD COLUMN archived BOOLEAN NOT NULL DEFAULT false;

-- Create index for better performance on archived events
CREATE INDEX idx_events_archived ON public.events(archived);
CREATE INDEX idx_events_date_time ON public.events(event_date, event_time);

-- Create function to archive expired events
CREATE OR REPLACE FUNCTION archive_expired_events()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  -- Archive regular events that are 2+ hours past their end time
  -- and are NOT part of any special event
  UPDATE public.events 
  SET archived = true, updated_at = now()
  WHERE archived = false
    AND (event_date + event_time + INTERVAL '2 hours') < now()
    AND id NOT IN (
      SELECT DISTINCT sea.event_id 
      FROM special_event_assignments sea
      JOIN special_events se ON sea.special_event_id = se.id
      WHERE se.is_active = true
    );

  -- Archive events that are part of special events, but only after the special event has ended
  UPDATE public.events 
  SET archived = true, updated_at = now()
  WHERE archived = false
    AND id IN (
      SELECT DISTINCT sea.event_id 
      FROM special_event_assignments sea
      JOIN special_events se ON sea.special_event_id = se.id
      WHERE se.is_active = true
        AND (
          -- Single day special event: use start_date + 2 hours buffer
          (se.end_date IS NULL AND se.start_date + INTERVAL '1 day' + INTERVAL '2 hours' < now())
          OR
          -- Multi-day special event: use end_date + 2 hours buffer
          (se.end_date IS NOT NULL AND se.end_date + INTERVAL '1 day' + INTERVAL '2 hours' < now())
        )
    );

  -- Log the archiving operation
  RAISE NOTICE 'Event archiving completed at %', now();
END;
$$;

-- Enable pg_cron extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule the archiving function to run every hour
SELECT cron.schedule(
  'archive-expired-events',
  '0 * * * *', -- Every hour at minute 0
  $$SELECT archive_expired_events();$$
);

-- Update RLS policies to exclude archived events from public view by default
DROP POLICY IF EXISTS "Events are viewable by everyone" ON public.events;

CREATE POLICY "Active events are viewable by everyone" 
ON public.events 
FOR SELECT 
USING (archived = false);

-- Allow authenticated users to view archived events if needed
CREATE POLICY "Authenticated users can view archived events" 
ON public.events 
FOR SELECT 
USING (auth.uid() IS NOT NULL);