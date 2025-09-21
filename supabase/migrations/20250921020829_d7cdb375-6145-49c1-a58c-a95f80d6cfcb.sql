-- Make registration_notes nullable since it's optional
ALTER TABLE public.events 
ALTER COLUMN registration_notes DROP NOT NULL;