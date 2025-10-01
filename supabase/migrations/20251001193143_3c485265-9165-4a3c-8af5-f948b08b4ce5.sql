-- Update American Legion Post 483 website
UPDATE public.resources 
SET 
  website = 'https://www.facebook.com/pastcommanderlee/',
  updated_at = now()
WHERE organization_name = 'American Legion Post 483';