-- Remove "wellness" category from resources
UPDATE public.resources
SET categories = array_remove(categories, 'wellness')
WHERE 'wellness' = ANY(categories);

-- Also handle capitalized variations
UPDATE public.resources
SET categories = array_remove(categories, 'Wellness')
WHERE 'Wellness' = ANY(categories);

UPDATE public.resources
SET categories = array_remove(categories, 'WELLNESS')
WHERE 'WELLNESS' = ANY(categories);