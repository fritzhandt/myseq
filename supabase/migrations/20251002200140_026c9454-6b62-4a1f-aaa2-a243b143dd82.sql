-- Update organizations with original correct logos and missing websites

-- Black Spectrum Theater - use original PNG logo
UPDATE public.resources 
SET logo_url = '/resource-logos/black-spectrum-theater-logo.png'
WHERE organization_name = 'Black Spectrum Theater';

-- Douglass King Regular Democratic Club - use original logo
UPDATE public.resources 
SET logo_url = '/resource-logos/douglass-king-club-logo.jpg'
WHERE organization_name = 'Douglass King Regular Democratic Club';

-- Dreamchaser NYC - use original logo
UPDATE public.resources 
SET logo_url = '/resource-logos/dreamchasernyc-logo.jpg'
WHERE organization_name = 'Dreamchaser NYC';

-- Elner Blackburn Regular Democratic Club - use original logo and add website
UPDATE public.resources 
SET logo_url = '/resource-logos/elner-blackburn-club-logo.jpg',
    website = 'https://www.facebook.com/ElnerBlackburnRegularDemocraticClub'
WHERE organization_name = 'Elner Blackburn Regular Democratic Club';

-- Guy R Brewer Democratic Club - use original logo
UPDATE public.resources 
SET logo_url = '/resource-logos/guy-r-brewer-club-logo.jpg'
WHERE organization_name = 'Guy R Brewer Democratic Club';

-- JPAC - use original PNG logo
UPDATE public.resources 
SET logo_url = '/resource-logos/jpac-logo.png'
WHERE organization_name = 'JPAC';

-- SNAP Eastern Queens Center - use general SNAP logo and add website
UPDATE public.resources 
SET logo_url = '/resource-logos/snap-logo.jpg',
    website = 'https://snapqueens.org'
WHERE organization_name = 'SNAP Eastern Queens Center';

-- SNAP Bellerose Center - already has correct logo, keep it
-- (using snap-brookville-center-logo-correct.jpg)

-- Rosedale Lions - use original logo
UPDATE public.resources 
SET logo_url = '/resource-logos/rosedale-lions-logo.jpg'
WHERE organization_name = 'Rosedale Lions';

-- Rochdale Senior Center - add website
UPDATE public.resources 
SET website = 'https://www.rochdalevil.com/senior-center'
WHERE organization_name = 'Rochdale Senior Center';