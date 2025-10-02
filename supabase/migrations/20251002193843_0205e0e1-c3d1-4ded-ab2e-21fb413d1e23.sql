-- Add new business opportunity organizations
INSERT INTO public.resources (
  organization_name, 
  description, 
  website, 
  logo_url, 
  phone, 
  email, 
  address, 
  type, 
  categories
) VALUES 
(
  'Empire State Development (ESD)', 
  'Empire State Development (ESD) is New York''s chief economic development agency, providing financial assistance and business support to help companies grow and create jobs in New York State.', 
  'https://www.esd.ny.gov', 
  '/resource-logos/empire-state-development-logo.jpg', 
  '(212) 803-2300', 
  'info@esd.ny.gov', 
  '633 Third Avenue, 36th Floor, New York, NY 10017', 
  'business_opportunity', 
  ARRAY[]::text[]
),
(
  'JFK Redevelopment (Port Authority of NY & NJ)', 
  'The Port Authority of New York and New Jersey is leading the comprehensive redevelopment of JFK Airport, creating opportunities for businesses and community engagement throughout the project.', 
  'https://www.portauthoritybuilds.com/redevelopment/us/en/jfk/community-outreach.html', 
  '/resource-logos/jfk-redevelopment-logo.png', 
  '(718) 244-3834', 
  'JFKcommunity@panynj.gov', 
  '144-33 & 35 Jamaica Avenue, Jamaica, NY 11435', 
  'business_opportunity', 
  ARRAY[]::text[]
),
(
  'UBS Business Alliance (UBS Arena)', 
  'The UBS Business Alliance connects local businesses with opportunities at UBS Arena, fostering partnerships and supporting economic growth in the surrounding community.', 
  'https://ubsarena.com/ubs-arena-business-alliance/', 
  '/resource-logos/ubs-business-alliance-logo.png', 
  NULL, 
  'businessalliance@ubsarena.com', 
  'UBS Arena, 2400 Hempstead Turnpike, Elmont, NY 11003', 
  'business_opportunity', 
  ARRAY[]::text[]
);