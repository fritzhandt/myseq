-- Add cover photo field to resources table
ALTER TABLE public.resources ADD COLUMN IF NOT EXISTS cover_photo_url TEXT;