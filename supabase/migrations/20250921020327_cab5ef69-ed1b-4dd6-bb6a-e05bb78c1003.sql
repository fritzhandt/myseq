-- Add separate fields for registration contact information
ALTER TABLE public.events 
ADD COLUMN registration_phone TEXT NULL,
ADD COLUMN registration_email TEXT NULL;

-- Note: office_address already exists, we'll rename registration_instructions to be clearer
ALTER TABLE public.events 
RENAME COLUMN registration_instructions TO registration_notes;