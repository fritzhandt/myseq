-- Fix the search_path security warning by setting it properly
CREATE OR REPLACE FUNCTION archive_expired_events()
RETURNS void
LANGUAGE plpgsql
SET search_path = public
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
      FROM public.special_event_assignments sea
      JOIN public.special_events se ON sea.special_event_id = se.id
      WHERE se.is_active = true
    );

  -- Archive events that are part of special events, but only after the special event has ended
  UPDATE public.events 
  SET archived = true, updated_at = now()
  WHERE archived = false
    AND id IN (
      SELECT DISTINCT sea.event_id 
      FROM public.special_event_assignments sea
      JOIN public.special_events se ON sea.special_event_id = se.id
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