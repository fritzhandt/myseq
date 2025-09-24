-- Add photos column to civic_announcements table
ALTER TABLE public.civic_announcements 
ADD COLUMN photos text[] DEFAULT '{}';

-- Add comment for documentation
COMMENT ON COLUMN public.civic_announcements.photos IS 'Array of photo URLs for the announcement';