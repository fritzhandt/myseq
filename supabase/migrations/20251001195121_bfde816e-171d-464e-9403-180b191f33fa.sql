-- Update NYLAG address
UPDATE public.resources 
SET 
  address = '100 Pearl St 19th floor, New York, NY 10004',
  updated_at = now()
WHERE organization_name = 'NYLAG';