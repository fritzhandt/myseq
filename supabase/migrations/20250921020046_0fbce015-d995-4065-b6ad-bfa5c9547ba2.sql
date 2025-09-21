-- Add registration fields to events table
ALTER TABLE public.events 
ADD COLUMN registration_link TEXT NULL,
ADD COLUMN registration_instructions TEXT NOT NULL DEFAULT '',
ADD COLUMN office_address TEXT NULL;