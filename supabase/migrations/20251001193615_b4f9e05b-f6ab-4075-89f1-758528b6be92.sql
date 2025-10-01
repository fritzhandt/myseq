-- Update King of Kings Foundation logo with correct file
UPDATE public.resources 
SET 
  logo_url = '/resource-logos/king-of-kings-foundation-logo-correct.png',
  updated_at = now()
WHERE id = '650f1775-8566-41bb-b425-f8757f87e006';