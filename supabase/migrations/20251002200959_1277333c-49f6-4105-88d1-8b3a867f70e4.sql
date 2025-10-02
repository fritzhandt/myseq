-- Update organization logos from revised PDF

-- Empower My Hood
UPDATE public.resources 
SET logo_url = '/resource-logos/empower-my-hood-logo.png'
WHERE organization_name = 'Empower My Hood';

-- Young Men Strong
UPDATE public.resources 
SET logo_url = '/resource-logos/young-men-strong-logo.png'
WHERE organization_name = 'Young Men Strong';

-- Khan Tutorial
UPDATE public.resources 
SET logo_url = '/resource-logos/khan-tutorial-logo.png'
WHERE organization_name = 'Khan Tutorial';

-- Kumon Math and Reading Center of St. Albans
UPDATE public.resources 
SET logo_url = '/resource-logos/kumon-logo-new.jpg'
WHERE organization_name LIKE '%Kumon%';

-- Neighborhood Housing Services
UPDATE public.resources 
SET logo_url = '/resource-logos/neighborhood-housing-services-logo-new.jpg'
WHERE organization_name LIKE '%Neighborhood Housing Services%';

-- Queens Defenders
UPDATE public.resources 
SET logo_url = '/resource-logos/queens-defenders-logo-new.png'
WHERE organization_name = 'Queens Defenders';

-- Girl Scouts of Greater New York
UPDATE public.resources 
SET logo_url = '/resource-logos/girl-scouts-logo-new.png'
WHERE organization_name LIKE '%Girl Scouts%';

-- JPAC
UPDATE public.resources 
SET logo_url = '/resource-logos/jpac-logo-new.jpg'
WHERE organization_name = 'JPAC';

-- Black Spectrum Theater
UPDATE public.resources 
SET logo_url = '/resource-logos/black-spectrum-theater-logo-new.png'
WHERE organization_name = 'Black Spectrum Theater';

-- Douglass King Regular Democratic Club
UPDATE public.resources 
SET logo_url = '/resource-logos/douglass-king-club-logo-new.jpg'
WHERE organization_name = 'Douglass King Regular Democratic Club';

-- Guy R Brewer Democratic Club
UPDATE public.resources 
SET logo_url = '/resource-logos/guy-r-brewer-club-logo-new.jpg'
WHERE organization_name = 'Guy R Brewer Democratic Club';

-- Elner Blackburn Regular Democratic Club
UPDATE public.resources 
SET logo_url = '/resource-logos/elner-blackburn-club-logo-new.jpg'
WHERE organization_name = 'Elner Blackburn Regular Democratic Club';

-- Robert Couch Senior Center
UPDATE public.resources 
SET logo_url = '/resource-logos/robert-couch-senior-logo-new.jpg'
WHERE organization_name LIKE '%Robert Couch%';

-- Rochdale Senior Center
UPDATE public.resources 
SET logo_url = '/resource-logos/rochdale-senior-logo-new.png'
WHERE organization_name = 'Rochdale Senior Center';

-- Rosedale Lions
UPDATE public.resources 
SET logo_url = '/resource-logos/rosedale-lions-logo-new.jpg'
WHERE organization_name = 'Rosedale Lions';

-- DreamchaserNYC
UPDATE public.resources 
SET logo_url = '/resource-logos/dreamchasernyc-logo-new.jpg'
WHERE organization_name = 'Dreamchaser NYC';

-- You Can Go To College
UPDATE public.resources 
SET logo_url = '/resource-logos/you-can-go-to-college-logo-new.jpg'
WHERE organization_name LIKE '%You Can Go To College%';