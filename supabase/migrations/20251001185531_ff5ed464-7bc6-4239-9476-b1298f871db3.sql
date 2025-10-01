-- Add contact information for business opportunities from PDF

-- Greater Jamaica Development Corporation
UPDATE public.resources 
SET 
  website = 'https://gjdc.org/',
  phone = '718-291-0282',
  email = 'info@gjdc.org',
  address = '90-04 161 St, Jamaica NY 11432',
  updated_at = now()
WHERE organization_name = 'Greater Jamaica Development Corporation' AND type = 'business_opportunity';

-- NYC Small Business Solutions
UPDATE public.resources 
SET 
  website = 'https://www.nyc.gov/site/sbs/index.page',
  address = '90-27 Sutphin Blvd, Jamaica NY 11435',
  updated_at = now()
WHERE organization_name = 'NYC Small Business Solutions';

-- Queens Corporate Center (Emmanuel Realty)
UPDATE public.resources 
SET 
  website = 'https://www.cbemmanuel.com/what-we-do/',
  phone = '212-534-6001',
  email = 'info@cbemmanuel.com',
  address = '221-10 Jamaica NY 11429',
  updated_at = now()
WHERE organization_name = 'Queens Corporate Center';

-- Resort World Career Center
UPDATE public.resources 
SET 
  website = 'https://rwnewyork.com/careers/',
  phone = '(888) 888-8801',
  email = 'guestfeedback@rwnewyork.com',
  address = '110-00 Rockaway Blvd. Jamaica, NY 11420',
  updated_at = now()
WHERE organization_name = 'Resort World Career Center';