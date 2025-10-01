-- Update A Better Jamaica logo
UPDATE public.resources 
SET 
  logo_url = '/resource-logos/a-better-jamaica-logo-new.png',
  updated_at = now()
WHERE organization_name = 'A Better Jamaica';