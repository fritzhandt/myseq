-- Update logo for Greater Nexus
UPDATE public.resources 
SET 
  logo_url = '/resource-logos/greater-nexus-logo.webp',
  updated_at = now()
WHERE organization_name = 'Greater Nexus';