-- Update Leroy Comrie contact information
UPDATE public.elected_officials
SET 
  phone = '(718) 765-6359',
  email = 'comrie@nysenate.gov',
  updated_at = now()
WHERE name = 'Leroy Comrie' AND level = 'state' AND category = 'legislative';