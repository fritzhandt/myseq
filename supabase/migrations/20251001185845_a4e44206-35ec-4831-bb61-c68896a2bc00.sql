-- Update contact information for Greater Nexus
UPDATE public.resources 
SET 
  address = '89-14 Parsons Blvd. Jamaica NY 11432',
  phone = '(718) 291-0753',
  updated_at = now()
WHERE organization_name = 'Greater Nexus';