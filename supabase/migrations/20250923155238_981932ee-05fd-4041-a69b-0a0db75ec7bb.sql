-- Add missing NYS Assembly members
INSERT INTO public.elected_officials (name, title, office, level, category, district, party, phone, email, office_address, website) VALUES
('Clyde Vanel', 'Assembly Member', 'NYS Assembly', 'state', 'legislative', 'District 33', 'Democratic', '718-723-9008', 'vanelc@nyassembly.gov', '218-06 Linden Blvd., Cambria Heights, NY 11411', 'nyassembly.gov/mem/Clyde-Vanel'),
('Vivian Cook', 'Assembly Member', 'NYS Assembly', 'state', 'legislative', 'District 32', 'Democratic', '718-322-3975', 'cookv@nyassembly.gov', '142-16 Rockaway Blvd., Jamaica, NY 11436', 'nyassembly.gov/mem/Vivian-Cook'),
('Alicia Hyndman', 'Assembly Member', 'NYS Assembly', 'state', 'legislative', 'District 29', 'Democratic', '718-723-5412', 'hyndmana@nyassembly.gov', '224-03 Linden Blvd., Cambria Heights, NY 11411', 'nyassembly.gov/mem/Alicia-Hyndman');

-- Add missing NYS Senate member
INSERT INTO public.elected_officials (name, title, office, level, category, district, party, phone, email, office_address, website) VALUES
('Toby Ann Stavisky', 'Senator', 'NYS Senate', 'state', 'legislative', 'District 16', 'Democratic', '718-445-0004', 'stavisky@nysenate.gov', '142-37 37th Avenue, Flushing, NY 11354', 'nysenate.gov/senators/toby-ann-stavisky');

-- Remove any city council members that shouldn't be there and keep only the correct ones
DELETE FROM public.elected_officials WHERE level = 'city' AND category = 'legislative' AND office = 'NYC Council' 
AND name NOT IN ('Adrienne Adams', 'Nantasha Williams', 'Linda Lee');

-- Update Eric Adams to ensure he appears first in executive listings by updating created_at or adding an order field
-- First, let's update Eric Adams entry to ensure proper data
UPDATE public.elected_officials 
SET 
  name = 'Eric Adams',
  title = 'Mayor',
  office = 'Mayor of NYC',
  level = 'city',
  category = 'executive',
  phone = '212-788-3000',
  email = 'mayor@cityhall.nyc.gov',
  office_address = 'City Hall, New York, NY 10007',
  website = 'nyc.gov/office-of-the-mayor',
  created_at = '2020-01-01 00:00:00'  -- Earlier date to ensure first ordering
WHERE name ILIKE '%eric%adams%' AND level = 'city' AND category = 'executive';

-- If Eric Adams doesn't exist, insert him
INSERT INTO public.elected_officials (name, title, office, level, category, phone, email, office_address, website, created_at)
SELECT 'Eric Adams', 'Mayor', 'Mayor of NYC', 'city', 'executive', '212-788-3000', 'mayor@cityhall.nyc.gov', 'City Hall, New York, NY 10007', 'nyc.gov/office-of-the-mayor', '2020-01-01 00:00:00'
WHERE NOT EXISTS (
  SELECT 1 FROM public.elected_officials 
  WHERE name ILIKE '%eric%adams%' AND level = 'city' AND category = 'executive'
);

-- Ensure the correct city council members exist with proper data
INSERT INTO public.elected_officials (name, title, office, level, category, district, party, phone, email, office_address, website) 
VALUES
('Adrienne Adams', 'Speaker/Council Member', 'NYC Council', 'city', 'legislative', 'District 28', 'Democratic', '718-206-2068', 'aadams@council.nyc.gov', '176-16 Union Turnpike, Fresh Meadows, NY 11366', 'council.nyc.gov/district-28'),
('Nantasha Williams', 'Council Member', 'NYC Council', 'city', 'legislative', 'District 27', 'Democratic', '718-776-3700', 'nwilliams@council.nyc.gov', '31-09 Newtown Avenue, Astoria, NY 11102', 'council.nyc.gov/district-27'),
('Linda Lee', 'Council Member', 'NYC Council', 'city', 'legislative', 'District 23', 'Democratic', '718-888-8747', 'llee@council.nyc.gov', '136-61 Roosevelt Avenue, Flushing, NY 11354', 'council.nyc.gov/district-23')
ON CONFLICT DO NOTHING;