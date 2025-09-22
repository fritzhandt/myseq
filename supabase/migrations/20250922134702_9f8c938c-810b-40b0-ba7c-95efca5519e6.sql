-- Add separate contact fields and remove the generic contact_info field
ALTER TABLE public.resources 
ADD COLUMN phone TEXT,
ADD COLUMN email TEXT,
ADD COLUMN address TEXT;

-- Drop the old contact_info column
ALTER TABLE public.resources 
DROP COLUMN contact_info;