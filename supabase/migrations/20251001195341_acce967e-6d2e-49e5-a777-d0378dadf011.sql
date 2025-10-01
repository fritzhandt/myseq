-- Update Showing Hearts Foundation address
UPDATE public.resources 
SET 
  address = '204-17 Hillside Ave Ste 142, Hollis, NY 11423',
  updated_at = now()
WHERE organization_name = 'Showing Hearts Foundation';