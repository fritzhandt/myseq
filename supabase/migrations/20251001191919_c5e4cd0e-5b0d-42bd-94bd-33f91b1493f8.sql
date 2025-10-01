-- Update Joe's Academy of Music logo
UPDATE public.resources 
SET 
  logo_url = '/resource-logos/joes-academy-of-music-logo-correct.png',
  updated_at = now()
WHERE organization_name = 'Joe''s Academy of Music';