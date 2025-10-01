-- Move Melinda Katz from prosecutor to executive category
UPDATE public.elected_officials 
SET 
  category = 'executive',
  office = 'Queens DA',
  email = 'info@queensda.org',
  phone = '(718) 286-6000',
  office_address = '125-01 Queens Boulevard, Kew Gardens, NY 11415',
  website = 'queensda.org',
  party = 'Democratic',
  updated_at = now()
WHERE name = 'Melinda Katz';

-- Delete any other prosecutors (they are outside Southeast Queens service area)
DELETE FROM public.elected_officials 
WHERE category = 'prosecutor' AND name != 'Melinda Katz';