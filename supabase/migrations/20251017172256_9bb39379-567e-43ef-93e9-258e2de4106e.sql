-- Update district information and address for elected officials

-- John Liu - District 16
UPDATE public.elected_officials
SET 
  district = '16',
  updated_at = now()
WHERE name = 'John Liu';

-- Toby Ann Stavisky - District 11
UPDATE public.elected_officials
SET 
  district = '11',
  updated_at = now()
WHERE name = 'Toby Ann Stavisky' OR name = 'Toby Stavisky';

-- Selvena Brooks-Powers - Add address
UPDATE public.elected_officials
SET 
  office_address = '222-02 Merrick Blvd, Laurelton, NY 11413',
  updated_at = now()
WHERE name = 'Selvena Brooks-Powers';