-- Update contact information for multiple elected officials

-- James Sanders Jr.
UPDATE public.elected_officials
SET 
  phone = '718-523-3069',
  updated_at = now()
WHERE name = 'James Sanders Jr.' OR name = 'James Sanders';

-- John Liu
UPDATE public.elected_officials
SET 
  phone = '718-765-6675',
  office_address = '38-50 Bell Boulevard, Suite C, Bayside, NY 11361',
  updated_at = now()
WHERE name = 'John Liu';

-- Toby Ann Stavisky
UPDATE public.elected_officials
SET 
  phone = '718-445-0004',
  office_address = '134-01 20th Avenue, 2nd Floor, College Point, NY 11356',
  updated_at = now()
WHERE name = 'Toby Ann Stavisky' OR name = 'Toby Stavisky';

-- Clyde Vanel
UPDATE public.elected_officials
SET 
  phone = '718-479-2333',
  office_address = '97-01 Springfield Blvd, Queens Village, NY 11429',
  updated_at = now()
WHERE name = 'Clyde Vanel';

-- Alicia Hyndman
UPDATE public.elected_officials
SET 
  phone = '718-723-5412',
  office_address = '232-06A Merrick Blvd, Springfield Gardens, NY 11413',
  updated_at = now()
WHERE name = 'Alicia Hyndman';

-- Khaleel Anderson
UPDATE public.elected_officials
SET 
  phone = '718-327-1845',
  office_address = '1931 Mott Avenue, Suite 301, Far Rockaway, NY 11691',
  updated_at = now()
WHERE name = 'Khaleel Anderson';

-- Vivian Cook
UPDATE public.elected_officials
SET 
  phone = '718-322-3975',
  office_address = '142-15 Rockaway Blvd, Jamaica, NY 11436',
  updated_at = now()
WHERE name = 'Vivian Cook';