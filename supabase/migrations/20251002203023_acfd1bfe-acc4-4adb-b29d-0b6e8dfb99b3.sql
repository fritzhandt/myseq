-- Fix logos for organizations with exact name matches

-- JPAC (full name)
UPDATE public.resources 
SET logo_url = '/resource-logos/jpac-logo-updated.jpg'
WHERE organization_name = 'Jamaica Performing Arts Center (JPAC)';

-- DreamchaserNYC (no space)
UPDATE public.resources 
SET logo_url = '/resource-logos/dreamchasernyc-logo-updated.jpg'
WHERE organization_name = 'DreamchaserNYC';