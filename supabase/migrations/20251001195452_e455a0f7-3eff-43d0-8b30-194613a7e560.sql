-- Update Southeast Queens Residential Environmental Justice Coalition address
UPDATE public.resources 
SET 
  address = '222-34 96th Ave, Jamaica, NY 11429',
  updated_at = now()
WHERE organization_name = 'Southeast Queens Residential Environmental Justice Coalition';