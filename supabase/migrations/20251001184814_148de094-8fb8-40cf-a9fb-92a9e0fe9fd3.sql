-- Fix mismatched logos
-- Floral Park Public Library should have Friends of the Library logo
UPDATE public.resources 
SET logo_url = '/resource-logos/floral-park-library-friends-logo.jpg', updated_at = now() 
WHERE organization_name = 'Floral Park Public Library';

-- Jamaica Family Wellness Center doesn't have a logo in the document
UPDATE public.resources 
SET logo_url = NULL, updated_at = now() 
WHERE organization_name = 'Jamaica Family Wellness Center';