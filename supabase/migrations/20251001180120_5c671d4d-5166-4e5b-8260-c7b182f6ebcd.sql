-- Remove logo from Life Camp organization
UPDATE public.resources
SET logo_url = NULL,
    updated_at = now()
WHERE organization_name = 'Life Camp';