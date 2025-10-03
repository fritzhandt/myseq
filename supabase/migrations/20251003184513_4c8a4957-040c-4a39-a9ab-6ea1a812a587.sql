-- Create user_profiles table for sub-admin contact information
CREATE TABLE public.user_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  phone_number text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Users can view and update their own profile
CREATE POLICY "Users can view their own profile"
  ON public.user_profiles
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
  ON public.user_profiles
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON public.user_profiles
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Main admins can view all profiles
CREATE POLICY "Main admins can view all profiles"
  ON public.user_profiles
  FOR SELECT
  USING (is_main_admin(auth.uid()));

-- Create trigger for updated_at
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add submitter_name and submitter_phone to pending tables
ALTER TABLE public.pending_resource_modifications 
  ADD COLUMN submitter_name text,
  ADD COLUMN submitter_phone text;

ALTER TABLE public.pending_job_modifications 
  ADD COLUMN submitter_name text,
  ADD COLUMN submitter_phone text;

ALTER TABLE public.pending_civic_modifications 
  ADD COLUMN submitter_name text,
  ADD COLUMN submitter_phone text;

ALTER TABLE public.pending_events 
  ADD COLUMN submitter_name text,
  ADD COLUMN submitter_phone text;

ALTER TABLE public.pending_resources 
  ADD COLUMN submitter_name text,
  ADD COLUMN submitter_phone text;

ALTER TABLE public.pending_community_alerts 
  ADD COLUMN submitter_name text,
  ADD COLUMN submitter_phone text;

ALTER TABLE public.pending_special_events 
  ADD COLUMN submitter_name text,
  ADD COLUMN submitter_phone text;