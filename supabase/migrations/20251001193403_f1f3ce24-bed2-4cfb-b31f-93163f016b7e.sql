-- Update Joe's Academy of Music logo using ID
UPDATE public.resources 
SET 
  logo_url = '/resource-logos/joes-academy-logo-final.png',
  updated_at = now()
WHERE id = '63fdd338-b728-4670-82be-0f33e31e4781';