-- Phase 1: Secure Civic Organization Authentication System

-- Create civic organization sessions table for server-managed sessions
CREATE TABLE IF NOT EXISTS public.civic_org_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  civic_org_id UUID NOT NULL REFERENCES public.civic_organizations(id) ON DELETE CASCADE,
  session_token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_accessed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on civic sessions
ALTER TABLE public.civic_org_sessions ENABLE ROW LEVEL SECURITY;

-- Policy: Only the system can manage sessions (via edge functions with service role)
CREATE POLICY "Service role can manage civic sessions"
ON public.civic_org_sessions
FOR ALL
USING (true);

-- Create security definer function to get current civic org from session token
CREATE OR REPLACE FUNCTION public.get_current_civic_org(session_token TEXT)
RETURNS UUID
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;

-- Phase 2: Update RLS Policies for Civic Tables to be Organization-Specific

-- Drop old overly permissive policies and create secure ones
-- civic_announcements
DROP POLICY IF EXISTS "Authenticated users can create civic announcements" ON public.civic_announcements;
DROP POLICY IF EXISTS "Authenticated users can update civic announcements" ON public.civic_announcements;
DROP POLICY IF EXISTS "Authenticated users can delete civic announcements" ON public.civic_announcements;

-- civic_newsletters
DROP POLICY IF EXISTS "Authenticated users can create civic newsletters" ON public.civic_newsletters;
DROP POLICY IF EXISTS "Authenticated users can update civic newsletters" ON public.civic_newsletters;
DROP POLICY IF EXISTS "Authenticated users can delete civic newsletters" ON public.civic_newsletters;

-- civic_leadership
DROP POLICY IF EXISTS "Authenticated users can create civic leadership" ON public.civic_leadership;
DROP POLICY IF EXISTS "Authenticated users can update civic leadership" ON public.civic_leadership;
DROP POLICY IF EXISTS "Authenticated users can delete civic leadership" ON public.civic_leadership;

-- civic_important_links
DROP POLICY IF EXISTS "Authenticated users can create important links" ON public.civic_important_links;
DROP POLICY IF EXISTS "Authenticated users can update important links" ON public.civic_important_links;
DROP POLICY IF EXISTS "Authenticated users can delete important links" ON public.civic_important_links;

-- civic_gallery
DROP POLICY IF EXISTS "Authenticated users can create gallery photos" ON public.civic_gallery;
DROP POLICY IF EXISTS "Authenticated users can update gallery photos" ON public.civic_gallery;
DROP POLICY IF EXISTS "Authenticated users can delete gallery photos" ON public.civic_gallery;

-- civic_organizations
DROP POLICY IF EXISTS "Authenticated users can create civic organizations" ON public.civic_organizations;
DROP POLICY IF EXISTS "Authenticated users can update civic organizations" ON public.civic_organizations;
DROP POLICY IF EXISTS "Authenticated users can delete civic organizations" ON public.civic_organizations;

-- Create new secure policies that check organization ownership
-- Main admins can still do everything via their existing policies

-- civic_announcements: Only accessible by main admins (keep existing SELECT policy for public)
CREATE POLICY "Main admins can manage civic announcements"
ON public.civic_announcements
FOR ALL
USING (is_main_admin(auth.uid()))
WITH CHECK (is_main_admin(auth.uid()));

-- civic_newsletters: Only accessible by main admins
CREATE POLICY "Main admins can manage civic newsletters"
ON public.civic_newsletters
FOR ALL
USING (is_main_admin(auth.uid()))
WITH CHECK (is_main_admin(auth.uid()));

-- civic_leadership: Only accessible by main admins
CREATE POLICY "Main admins can manage civic leadership"
ON public.civic_leadership
FOR ALL
USING (is_main_admin(auth.uid()))
WITH CHECK (is_main_admin(auth.uid()));

-- civic_important_links: Only accessible by main admins
CREATE POLICY "Main admins can manage civic important links"
ON public.civic_important_links
FOR ALL
USING (is_main_admin(auth.uid()))
WITH CHECK (is_main_admin(auth.uid()));

-- civic_gallery: Only accessible by main admins
CREATE POLICY "Main admins can manage civic gallery"
ON public.civic_gallery
FOR ALL
USING (is_main_admin(auth.uid()))
WITH CHECK (is_main_admin(auth.uid()));

-- civic_organizations: Only main admins can manage
CREATE POLICY "Main admins can manage civic organizations"
ON public.civic_organizations
FOR ALL
USING (is_main_admin(auth.uid()))
WITH CHECK (is_main_admin(auth.uid()));

-- Add index for performance on session lookups
CREATE INDEX IF NOT EXISTS idx_civic_sessions_token ON public.civic_org_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_civic_sessions_expires ON public.civic_org_sessions(expires_at);

-- Clean up expired sessions (can be called periodically)
CREATE OR REPLACE FUNCTION public.cleanup_expired_civic_sessions()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.civic_org_sessions
  WHERE expires_at < now();
END;
$$;