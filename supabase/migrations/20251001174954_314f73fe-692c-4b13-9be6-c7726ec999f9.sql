
-- Add logo for King of Kings Foundation
-- Note: Logo needs to be sourced and uploaded to public/resource-logos/
UPDATE public.resources
SET logo_url = '/resource-logos/king-of-kings-foundation-logo.png',
    updated_at = now()
WHERE organization_name = 'King of Kings Foundation'
AND (logo_url IS NULL OR logo_url = '');
