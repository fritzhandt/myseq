-- Update the archive_expired_events function with new midnight-based logic
CREATE OR REPLACE FUNCTION public.archive_expired_events()
RETURNS void
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
BEGIN
  -- Archive regular events that are NOT part of any special event
  -- Logic: Archive at midnight of event day, or next midnight if event starts after 8pm
  UPDATE public.events 
  SET archived = true, updated_at = now()
  WHERE archived = false
    AND id NOT IN (
      SELECT DISTINCT sea.event_id 
      FROM public.special_event_assignments sea
      JOIN public.special_events se ON sea.special_event_id = se.id
      WHERE se.is_active = true
    )
    AND (
      -- Events starting at or before 8pm: archive at midnight of event day
      (event_time <= '20:00:00' AND now() >= (event_date + INTERVAL '1 day'))
      OR
      -- Events starting after 8pm: archive at midnight the next day
      (event_time > '20:00:00' AND now() >= (event_date + INTERVAL '2 days'))
    );

  -- Archive events that are part of special events, but only after the special event has ended
  -- (Keep existing special event logic unchanged)
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
  RAISE NOTICE 'Event archiving completed at % with new midnight-based logic', now();
END;
$function$;