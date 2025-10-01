-- Remove recreational category from Bellerose BID
UPDATE public.resources 
SET 
  categories = ARRAY[]::text[],
  updated_at = now()
WHERE id = '880427f8-459b-4674-ae22-b724a42e43ad';