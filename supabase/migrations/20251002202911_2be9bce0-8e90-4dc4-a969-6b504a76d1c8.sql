-- Update logos for organizations with corrected versions from PDF

-- Girl Scouts of Greater New York
UPDATE public.resources 
SET logo_url = '/resource-logos/girl-scouts-logo-updated.png'
WHERE organization_name LIKE '%Girl Scouts%';

-- JPAC
UPDATE public.resources 
SET logo_url = '/resource-logos/jpac-logo-updated.jpg'
WHERE organization_name = 'JPAC';

-- Black Spectrum Theater
UPDATE public.resources 
SET logo_url = '/resource-logos/black-spectrum-theater-logo-updated.png'
WHERE organization_name = 'Black Spectrum Theater';

-- Douglass King Regular Democratic Club
UPDATE public.resources 
SET logo_url = '/resource-logos/douglass-king-club-logo-updated.jpg'
WHERE organization_name = 'Douglass King Regular Democratic Club';

-- Guy R Brewer Democratic Club
UPDATE public.resources 
SET logo_url = '/resource-logos/guy-r-brewer-club-logo-updated.jpg'
WHERE organization_name = 'Guy R Brewer Democratic Club';

-- Elner Blackburn Regular Democratic Club
UPDATE public.resources 
SET logo_url = '/resource-logos/elner-blackburn-club-logo-updated.jpg'
WHERE organization_name = 'Elner Blackburn Regular Democratic Club';

-- SNAP Bellerose Center
UPDATE public.resources 
SET logo_url = '/resource-logos/snap-bellerose-logo-updated.jpg'
WHERE organization_name LIKE '%SNAP%Bellerose%' OR organization_name LIKE '%SNAP%Brookville%';

-- SNAP Eastern Queens Center
UPDATE public.resources 
SET logo_url = '/resource-logos/snap-eastern-queens-logo-updated.png'
WHERE organization_name = 'SNAP Eastern Queens Center';

-- Rosedale Lions
UPDATE public.resources 
SET logo_url = '/resource-logos/rosedale-lions-logo-updated.jpg'
WHERE organization_name = 'Rosedale Lions';

-- Dreamchaser NYC
UPDATE public.resources 
SET logo_url = '/resource-logos/dreamchasernyc-logo-updated.jpg'
WHERE organization_name = 'Dreamchaser NYC';