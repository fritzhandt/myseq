-- Add alt text columns to events table
ALTER TABLE public.events 
ADD COLUMN cover_photo_alt TEXT,
ADD COLUMN additional_images_alt TEXT[];

-- Add alt text columns to pending_events table
ALTER TABLE public.pending_events 
ADD COLUMN cover_photo_alt TEXT,
ADD COLUMN additional_images_alt TEXT[];

-- Add alt text columns to resources table
ALTER TABLE public.resources 
ADD COLUMN cover_photo_alt TEXT,
ADD COLUMN logo_alt TEXT;

-- Add alt text columns to pending_resources table
ALTER TABLE public.pending_resources 
ADD COLUMN cover_photo_alt TEXT,
ADD COLUMN logo_alt TEXT;

-- Add alt text columns to community_alerts table
ALTER TABLE public.community_alerts 
ADD COLUMN photos_alt TEXT[];

-- Add alt text columns to pending_community_alerts table
ALTER TABLE public.pending_community_alerts 
ADD COLUMN photos_alt TEXT[];

-- Add alt text column to civic_announcements table
ALTER TABLE public.civic_announcements 
ADD COLUMN photos_alt TEXT[];

-- Add alt text column to civic_gallery table
ALTER TABLE public.civic_gallery 
ADD COLUMN alt_text TEXT;

-- Add alt text column to civic_leadership table
ALTER TABLE public.civic_leadership 
ADD COLUMN photo_alt TEXT;