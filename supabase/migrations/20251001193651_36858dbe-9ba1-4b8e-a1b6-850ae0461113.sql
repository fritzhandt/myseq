-- Update Acacia Network categories to keep only Mental Health/Wellness
UPDATE public.resources 
SET 
  categories = ARRAY['mental health/wellness']::text[],
  updated_at = now()
WHERE id = 'eec310ef-6247-4fa1-9c84-d2e56a27a33a';