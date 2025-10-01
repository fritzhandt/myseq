-- Update Nantasha Williams from State Assembly to NYC Council
UPDATE public.elected_officials 
SET 
  title = 'Council Member',
  office = 'NYC Council',
  level = 'city',
  category = 'legislative',
  district = 'District 27',
  email = 'district27@council.nyc.gov',
  phone = '(718) 776-3700',
  office_address = '172-12 Linden Blvd, Queens, NY 11434',
  website = 'council.nyc.gov/nantasha-williams',
  party = 'Democratic',
  updated_at = now()
WHERE name = 'Nantasha Williams';

-- Remove Alvin Bragg (Manhattan DA - outside of service area)
DELETE FROM public.elected_officials WHERE name = 'Alvin Bragg';

-- Add Selvena Brooks-Powers as NYC Council Member District 31
INSERT INTO public.elected_officials (
  name,
  title,
  office,
  level,
  category,
  district,
  email,
  phone,
  office_address,
  website,
  party,
  created_at,
  updated_at
) VALUES (
  'Selvena Brooks-Powers',
  'Council Member',
  'NYC Council',
  'city',
  'legislative',
  'District 31',
  'District31@council.nyc.gov',
  '(718) 471-7014',
  '118-35 Guy R. Brewer Blvd, Jamaica, NY 11434',
  'council.nyc.gov/selvena-brooks-powers',
  'Democratic',
  now(),
  now()
) ON CONFLICT DO NOTHING;