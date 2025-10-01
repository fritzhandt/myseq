-- Fix logos for the four organizations
-- Joe's Academy of Music gets the correct logo
UPDATE public.resources 
SET logo_url = '/resource-logos/joes-academy-correct-logo.png', updated_at = now() 
WHERE organization_name = 'Joe''s Academy of Music';

-- My First School Experience gets the correct logo
UPDATE public.resources 
SET logo_url = '/resource-logos/my-first-school-correct-logo.png', updated_at = now() 
WHERE organization_name = 'My First School Experience';

-- Jamaica Family Wellness Center gets The Child Center of NY logo
UPDATE public.resources 
SET logo_url = '/resource-logos/child-center-ny-logo.jpg', updated_at = now() 
WHERE organization_name = 'Jamaica Family Wellness Center';

-- Masjid Eesa ibn Maryam - no logo found in document, set to NULL
UPDATE public.resources 
SET logo_url = NULL, updated_at = now() 
WHERE organization_name = 'Masjid Eesa ibn Maryam';