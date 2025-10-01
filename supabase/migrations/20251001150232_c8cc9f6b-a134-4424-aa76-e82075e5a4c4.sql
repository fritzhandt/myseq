-- Add Brad Lander as NYC Comptroller
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
  'Brad Lander',
  'New York City Comptroller',
  'NYC Comptroller',
  'city',
  'executive',
  'New York City',
  'comptroller@comptroller.nyc.gov',
  '(212) 669-3500',
  '1 Centre Street, New York, NY 10007',
  'comptroller.nyc.gov',
  'Democratic',
  now(),
  now()
) ON CONFLICT DO NOTHING;