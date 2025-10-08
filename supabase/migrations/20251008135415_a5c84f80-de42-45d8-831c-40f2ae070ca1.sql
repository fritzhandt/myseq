-- Drop the existing function
DROP FUNCTION IF EXISTS public.get_current_civic_org(text);

-- Recreate the function with VOLATILE instead of STABLE
CREATE OR REPLACE FUNCTION public.get_current_civic_org(session_token text)
 RETURNS uuid
 LANGUAGE plpgsql
 VOLATILE  -- Changed from STABLE to VOLATILE to allow UPDATE operations
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  org_id UUID;
BEGIN
  -- Check if session is valid and not expired
  SELECT civic_org_id INTO org_id
  FROM public.civic_org_sessions
  WHERE civic_org_sessions.session_token = get_current_civic_org.session_token
    AND expires_at > now();
  
  -- Update last accessed time if session found
  IF org_id IS NOT NULL THEN
    UPDATE public.civic_org_sessions
    SET last_accessed_at = now()
    WHERE civic_org_sessions.session_token = get_current_civic_org.session_token;
  END IF;
  
  RETURN org_id;
END;
$function$;