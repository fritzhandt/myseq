-- Update BlaQue Resource Network email and correct spelling
UPDATE public.resources 
SET 
  organization_name = 'BlaQue Resource Network',
  email = 'Blaqueresourcenetwork@gmail.com',
  updated_at = now()
WHERE organization_name = 'Blaque Resource Network';