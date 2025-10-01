-- Update website URL for Greater Nexus
UPDATE public.resources 
SET 
  website = 'https://thegreaternexus.com/',
  updated_at = now()
WHERE organization_name = 'Greater Nexus';