-- Fix foreign key constraints to allow user deletion
-- Drop existing constraints and recreate with ON DELETE SET NULL

-- pending_events table
ALTER TABLE public.pending_events
  DROP CONSTRAINT IF EXISTS pending_events_submitted_by_fkey,
  DROP CONSTRAINT IF EXISTS pending_events_reviewed_by_fkey;

ALTER TABLE public.pending_events
  ADD CONSTRAINT pending_events_submitted_by_fkey 
    FOREIGN KEY (submitted_by) 
    REFERENCES auth.users(id) 
    ON DELETE SET NULL,
  ADD CONSTRAINT pending_events_reviewed_by_fkey 
    FOREIGN KEY (reviewed_by) 
    REFERENCES auth.users(id) 
    ON DELETE SET NULL;

-- pending_resources table
ALTER TABLE public.pending_resources
  DROP CONSTRAINT IF EXISTS pending_resources_submitted_by_fkey,
  DROP CONSTRAINT IF EXISTS pending_resources_reviewed_by_fkey;

ALTER TABLE public.pending_resources
  ADD CONSTRAINT pending_resources_submitted_by_fkey 
    FOREIGN KEY (submitted_by) 
    REFERENCES auth.users(id) 
    ON DELETE SET NULL,
  ADD CONSTRAINT pending_resources_reviewed_by_fkey 
    FOREIGN KEY (reviewed_by) 
    REFERENCES auth.users(id) 
    ON DELETE SET NULL;

-- pending_community_alerts table
ALTER TABLE public.pending_community_alerts
  DROP CONSTRAINT IF EXISTS pending_community_alerts_submitted_by_fkey,
  DROP CONSTRAINT IF EXISTS pending_community_alerts_reviewed_by_fkey;

ALTER TABLE public.pending_community_alerts
  ADD CONSTRAINT pending_community_alerts_submitted_by_fkey 
    FOREIGN KEY (submitted_by) 
    REFERENCES auth.users(id) 
    ON DELETE SET NULL,
  ADD CONSTRAINT pending_community_alerts_reviewed_by_fkey 
    FOREIGN KEY (reviewed_by) 
    REFERENCES auth.users(id) 
    ON DELETE SET NULL;

-- pending_special_events table
ALTER TABLE public.pending_special_events
  DROP CONSTRAINT IF EXISTS pending_special_events_submitted_by_fkey,
  DROP CONSTRAINT IF EXISTS pending_special_events_reviewed_by_fkey;

ALTER TABLE public.pending_special_events
  ADD CONSTRAINT pending_special_events_submitted_by_fkey 
    FOREIGN KEY (submitted_by) 
    REFERENCES auth.users(id) 
    ON DELETE SET NULL,
  ADD CONSTRAINT pending_special_events_reviewed_by_fkey 
    FOREIGN KEY (reviewed_by) 
    REFERENCES auth.users(id) 
    ON DELETE SET NULL;

-- user_roles table - cascade delete roles when user is deleted
ALTER TABLE public.user_roles
  DROP CONSTRAINT IF EXISTS user_roles_user_id_fkey,
  DROP CONSTRAINT IF EXISTS user_roles_created_by_fkey;

ALTER TABLE public.user_roles
  ADD CONSTRAINT user_roles_user_id_fkey 
    FOREIGN KEY (user_id) 
    REFERENCES auth.users(id) 
    ON DELETE CASCADE,
  ADD CONSTRAINT user_roles_created_by_fkey 
    FOREIGN KEY (created_by) 
    REFERENCES auth.users(id) 
    ON DELETE SET NULL;