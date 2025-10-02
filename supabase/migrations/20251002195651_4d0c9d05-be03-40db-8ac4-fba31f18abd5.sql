-- Update organizations with correct logos

-- SNAP Bellerose Center should use the correct Brookville logo
UPDATE public.resources 
SET logo_url = '/resource-logos/snap-brookville-center-logo-correct.jpg'
WHERE organization_name = 'SNAP Bellerose Center';

-- SNAP Eastern Queens Center should keep the general SNAP logo
UPDATE public.resources 
SET logo_url = '/resource-logos/snap-logo.jpg'
WHERE organization_name = 'SNAP Eastern Queens Center';

-- Add Girl Scouts logo (using a placeholder for now - you'll need to provide the correct logo file)
-- UPDATE public.resources 
-- SET logo_url = '/resource-logos/girl-scouts-logo.png'
-- WHERE organization_name = 'Girl Scouts of Greater New York';

-- Note: The following organizations already have logos assigned from the folder.
-- If these are still incorrect, please provide the correct logo files:
-- - Black Spectrum Theater: /resource-logos/black-spectrum-theater-logo.png
-- - Douglass King Regular Democratic Club: /resource-logos/douglass-king-club-logo.jpg
-- - Dreamchaser NYC: /resource-logos/dreamchasernyc-logo.jpg
-- - Elner Blackburn Regular Democratic Club: /resource-logos/elner-blackburn-club-logo.jpg
-- - Guy R Brewer Democratic Club: /resource-logos/guy-r-brewer-club-logo.jpg
-- - JPAC: /resource-logos/jpac-logo.png
-- - Rosedale Lions: /resource-logos/rosedale-lions-logo.jpg