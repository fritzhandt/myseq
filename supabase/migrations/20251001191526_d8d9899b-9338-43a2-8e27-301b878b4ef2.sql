-- Update Good Taste restaurant logo
UPDATE public.resources 
SET 
  logo_url = '/resource-logos/good-taste-restaurant-logo.jpg',
  updated_at = now()
WHERE organization_name = 'Good Taste';