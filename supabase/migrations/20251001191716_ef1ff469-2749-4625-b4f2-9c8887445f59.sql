-- Update Good Taste Restaurant logo
UPDATE public.resources 
SET 
  logo_url = '/resource-logos/good-taste-restaurant-logo.jpg',
  updated_at = now()
WHERE organization_name = 'Good Taste Restaurant';

-- Update Ace Academic and Creative Studio logo to use the correct local path
UPDATE public.resources 
SET 
  logo_url = '/resource-logos/ace-academic-creative-studio-logo.jpg',
  updated_at = now()
WHERE organization_name = 'Ace Academic and Creative Studio ';