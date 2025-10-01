-- Remove email from Greater Nexus
UPDATE public.resources 
SET 
  email = NULL,
  updated_at = now()
WHERE organization_name = 'Greater Nexus';